const path = require("path");
const fs = require("fs");
const { FieldValue, getFirestore } = require("../config/firebase");
const { getBookingById, updateBooking } = require("./bookingStore");
const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId } = require("../config/appwrite");

const DEFAULT_AVG_CONSULT_TIME = 5;
let firebaseUnavailableLogged = false;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const DEFAULT_STATE = {
  queue: [],
  currentToken: null,
  lastTokenNumber: 0,
  avgConsultTime: DEFAULT_AVG_CONSULT_TIME,
};

let memoryState = { ...DEFAULT_STATE };

function normalizePatientInput(payload = {}) {
  const { name, reason, avgConsultTime, doctorId } = payload;
  const cleanName = String(name || "").trim();
  const cleanReason = String(reason || "").trim();
  const parsedAvgTime = Number(avgConsultTime);

  if (!cleanName) {
    throw createHttpError(400, "Patient name is required");
  }

  return {
    name: cleanName,
    reason: cleanReason || "General consultation",
    avgConsultTime: Number.isFinite(parsedAvgTime) && parsedAvgTime > 0
      ? parsedAvgTime
      : DEFAULT_AVG_CONSULT_TIME,
    doctorId: doctorId || null,
  };
}

function serializeState(state) {
  return {
    queue: state.queue || [],
    currentToken: state.currentToken || null,
    lastTokenNumber: state.lastTokenNumber || 0,
    avgConsultTime: state.avgConsultTime || DEFAULT_AVG_CONSULT_TIME,
  };
}

function calculateTokensAhead(queue, tokenNumber) {
  const index = queue.findIndex((patient) => patient.tokenNumber === tokenNumber);
  return index === -1 ? 0 : index;
}

function buildPublicState(state) {
  const safeState = serializeState(state);

  return {
    ...safeState,
    queue: safeState.queue.map((patient) => ({
      ...patient,
      tokensAhead: calculateTokensAhead(safeState.queue, patient.tokenNumber),
      waitTime: calculateTokensAhead(safeState.queue, patient.tokenNumber) * safeState.avgConsultTime,
    })),
  };
}

function getServiceAccountPath() {
  const rawPath = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!rawPath || rawPath.trim().startsWith("{")) {
    return null;
  }

  return path.resolve(process.cwd(), rawPath);
}

function canUseFirebase() {
  const serviceAccountPath = getServiceAccountPath();

  if (!serviceAccountPath) {
    return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  return fs.existsSync(serviceAccountPath);
}

function getStateDocument() {
  if (!canUseFirebase()) {
    if (!firebaseUnavailableLogged) {
      console.warn("Firebase service account missing. Using in-memory queue state.");
      firebaseUnavailableLogged = true;
    }

    return null;
  }

  return getFirestore().collection("queues").doc("default");
}

async function readStateFromFirestore(docRef) {
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    await docRef.set(DEFAULT_STATE);
    return { ...DEFAULT_STATE };
  }

  return serializeState(snapshot.data());
}

async function updateAppwriteQueueState(stateUpdater) {
  const db = getAppwriteDatabases();
  const dbId = getDatabaseId();

  const doc = await db.getDocument(dbId, "queues", "default");
  const currentState = {
    queue: JSON.parse(doc.queue || "[]"),
    currentToken: JSON.parse(doc.currentToken || "null"),
    lastTokenNumber: doc.lastTokenNumber,
    avgConsultTime: doc.avgConsultTime,
  };

  const nextState = stateUpdater(currentState);

  const updatedDoc = await db.updateDocument(dbId, "queues", "default", {
    queue: JSON.stringify(nextState.queue),
    currentToken: JSON.stringify(nextState.currentToken),
    lastTokenNumber: nextState.lastTokenNumber,
    avgConsultTime: nextState.avgConsultTime,
  });

  return buildPublicState({
    queue: JSON.parse(updatedDoc.queue || "[]"),
    currentToken: JSON.parse(updatedDoc.currentToken || "null"),
    lastTokenNumber: updatedDoc.lastTokenNumber,
    avgConsultTime: updatedDoc.avgConsultTime,
  });
}

async function getQueueState() {
  if (isAppwriteAvailable()) {
    try {
      const db = getAppwriteDatabases();
      const dbId = getDatabaseId();
      const doc = await db.getDocument(dbId, "queues", "default");
      return buildPublicState({
        queue: JSON.parse(doc.queue || "[]"),
        currentToken: JSON.parse(doc.currentToken || "null"),
        lastTokenNumber: doc.lastTokenNumber,
        avgConsultTime: doc.avgConsultTime,
      });
    } catch (e) {
      console.error("Appwrite queue read failed, returning default:", e);
      return buildPublicState(DEFAULT_STATE);
    }
  }

  const docRef = getStateDocument();

  if (!docRef) {
    return buildPublicState(memoryState);
  }

  const state = await readStateFromFirestore(docRef);
  return buildPublicState(state);
}

async function addPatient(payload) {
  const input = normalizePatientInput(payload);

  if (isAppwriteAvailable()) {
    return updateAppwriteQueueState((state) => addPatientToState(state, input));
  }

  const docRef = getStateDocument();

  if (!docRef) {
    memoryState = addPatientToState(memoryState, input);
    return buildPublicState(memoryState);
  }

  return runStateTransaction(docRef, (state) => addPatientToState(state, input));
}

async function addFromBooking(bookingId) {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  if (booking.status === "in_queue") {
    throw createHttpError(409, "Booking already added to queue");
  }

  if (!["confirmed", "arrived"].includes(booking.status)) {
    throw createHttpError(409, "Booking cannot enter queue");
  }

  const state = await addPatient({
    name: booking.patientName,
    reason: `Booked consult ${booking.time}`,
    doctorId: booking.doctorId,
  });

  await updateBooking(bookingId, {
    status: "in_queue",
    queuedAt: new Date().toISOString(),
  });

  return state;
}

async function callNextToken(doctorId) {
  if (isAppwriteAvailable()) {
    return updateAppwriteQueueState((state) => callNextInState(state, doctorId));
  }

  const docRef = getStateDocument();

  if (!docRef) {
    memoryState = callNextInState(memoryState, doctorId);
    return buildPublicState(memoryState);
  }

  return runStateTransaction(docRef, (state) => callNextInState(state, doctorId));
}

async function resetQueue() {
  if (isAppwriteAvailable()) {
    return updateAppwriteQueueState(() => DEFAULT_STATE);
  }

  const docRef = getStateDocument();

  if (!docRef) {
    memoryState = { ...DEFAULT_STATE };
    return buildPublicState(memoryState);
  }

  await docRef.set(DEFAULT_STATE);
  return buildPublicState(DEFAULT_STATE);
}

async function updateAvgConsultTime(avgConsultTime) {
  const parsedAvgTime = Number(avgConsultTime);

  if (!Number.isFinite(parsedAvgTime) || parsedAvgTime <= 0) {
    throw createHttpError(400, "Average consultation time must be greater than zero");
  }

  if (isAppwriteAvailable()) {
    return updateAppwriteQueueState((state) => ({ ...state, avgConsultTime: parsedAvgTime }));
  }

  const docRef = getStateDocument();

  if (!docRef) {
    memoryState = {
      ...memoryState,
      avgConsultTime: parsedAvgTime,
    };
    return buildPublicState(memoryState);
  }

  return runStateTransaction(docRef, (state) => ({
    ...state,
    avgConsultTime: parsedAvgTime,
  }));
}

function addPatientToState(state, input) {
  const safeState = serializeState(state);
  const tokenNumber = safeState.lastTokenNumber + 1;
  const patient = {
    id: `token-${tokenNumber}`,
    tokenNumber,
    name: input.name,
    reason: input.reason,
    status: "waiting",
    createdAt: new Date().toISOString(),
    doctorId: input.doctorId || null,
  };

  return {
    ...safeState,
    queue: [...safeState.queue, patient],
    lastTokenNumber: tokenNumber,
    avgConsultTime: input.avgConsultTime,
  };
}

function callNextInState(state, doctorId) {
  const safeState = serializeState(state);

  if (safeState.queue.length === 0) {
    throw createHttpError(400, "Queue is empty");
  }

  const index = doctorId
    ? safeState.queue.findIndex((p) => p.doctorId === doctorId)
    : 0;

  if (index === -1) {
    throw createHttpError(400, "No patients in queue for this doctor");
  }

  const nextPatient = safeState.queue[index];
  const remainingQueue = safeState.queue.filter((_, i) => i !== index);

  return {
    ...safeState,
    queue: remainingQueue,
    currentToken: {
      ...nextPatient,
      status: "serving",
      calledAt: new Date().toISOString(),
    },
  };
}

async function runStateTransaction(docRef, updateState) {
  const db = getFirestore();

  const nextState = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const currentState = snapshot.exists ? serializeState(snapshot.data()) : { ...DEFAULT_STATE };
    const updatedState = updateState(currentState);

    transaction.set(docRef, {
      ...updatedState,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return updatedState;
  });

  return buildPublicState(nextState);
}

module.exports = {
  addFromBooking,
  addPatient,
  callNextToken,
  getQueueState,
  resetQueue,
  updateAvgConsultTime,
};
