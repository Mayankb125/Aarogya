const { patients } = require("../data/phase2Seed");
const { searchBookings } = require("./bookingService");
const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId } = require("../config/appwrite");
const { getFirestore, isFirebaseAvailable } = require("../config/firebase");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function findPatient(id) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doc = await db.getDocument(dbId, "patients", id);
      return {
        ...doc,
        id: doc.$id,
        medicalHistory: JSON.parse(doc.medicalHistory || "[]"),
        reminders: JSON.parse(doc.reminders || "[]"),
        reports: JSON.parse(doc.reports || "[]"),
      };
    } catch (e) {
      return null;
    }
  }
  return patients.find((item) => item.id === id) || null;
}

async function getPatientProfile(id = "patient-demo") {
  const patient = id === undefined ? (await findPatient(patients[0].id)) : (await findPatient(id));

  if (!patient) {
    throw createHttpError(404, "Patient not found");
  }

  return {
    ...patient,
    bookings: await searchBookings(patient.name),
  };
}

function patientsCollection() {
  if (isFirebaseAvailable()) {
    return getFirestore().collection("patients");
  }
  const error = new Error("Firebase is not configured");
  error.statusCode = 503;
  throw error;
}

function normaliseProfile(payload = {}) {
  const name = String(payload.name || "").trim();
  if (!name) {
    throw createHttpError(400, "Name is required");
  }
  const age = Number(payload.age);
  if (!Number.isFinite(age) || age <= 0 || age > 130) {
    throw createHttpError(400, "Age must be a number between 1 and 130");
  }
  const phone = String(payload.phone || "").trim();
  if (!phone) {
    throw createHttpError(400, "Phone number is required");
  }
  const bloodGroup = String(payload.bloodGroup || "").trim();
  if (!bloodGroup) {
    throw createHttpError(400, "Blood group is required");
  }

  return {
    name,
    age,
    phone,
    bloodGroup,
    gender: String(payload.gender || "").trim() || "Not specified",
    address: String(payload.address || "").trim(),
    emergencyContact: String(payload.emergencyContact || "").trim(),
    allergies: String(payload.allergies || "").trim(),
    chronicConditions: String(payload.chronicConditions || "").trim(),
  };
}

async function getMe(uid) {
  if (!uid) {
    throw createHttpError(400, "uid is required");
  }

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doc = await db.getDocument(dbId, "patients", uid);
      return {
        uid: doc.$id,
        ...doc,
        medicalHistory: JSON.parse(doc.medicalHistory || "[]"),
        reminders: JSON.parse(doc.reminders || "[]"),
        reports: JSON.parse(doc.reports || "[]"),
      };
    } catch (e) {
      if (e.code === 404) return null;
      throw e;
    }
  }

  if (isFirebaseAvailable()) {
    const snap = await patientsCollection().doc(uid).get();
    if (!snap.exists) return null;
    return { uid, ...snap.data() };
  }

  // Local fallback mock
  return null;
}

async function upsertMyProfile(uid, payload = {}) {
  if (!uid) {
    throw createHttpError(400, "uid is required");
  }
  const profile = normaliseProfile(payload);

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    let existing = {};
    try {
      const doc = await db.getDocument(dbId, "patients", uid);
      existing = {
        ...doc,
        medicalHistory: JSON.parse(doc.medicalHistory || "[]"),
        reminders: JSON.parse(doc.reminders || "[]"),
        reports: JSON.parse(doc.reports || "[]"),
      };
    } catch (e) {
      // document does not exist yet
    }

    const next = {
      ...profile,
      medicalHistory: JSON.stringify(existing.medicalHistory || []),
      reminders: JSON.stringify(existing.reminders || []),
      reports: JSON.stringify(existing.reports || []),
      onboardedAt: existing.onboardedAt || new Date().toISOString(),
    };

    let saved;
    try {
      saved = await db.updateDocument(dbId, "patients", uid, next);
    } catch (e) {
      saved = await db.createDocument(dbId, "patients", uid, next);
    }

    return {
      uid: saved.$id,
      ...saved,
      medicalHistory: JSON.parse(saved.medicalHistory || "[]"),
      reminders: JSON.parse(saved.reminders || "[]"),
      reports: JSON.parse(saved.reports || "[]"),
    };
  }

  if (isFirebaseAvailable()) {
    const ref = patientsCollection().doc(uid);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : {};
    const next = {
      ...existing,
      ...profile,
      onboardedAt: existing.onboardedAt || new Date().toISOString(),
    };
    await ref.set(next, { merge: true });
    return { uid, ...next };
  }

  throw new Error("No backend database configured.");
}

async function listMyConsultations(uid) {
  const profile = await getMe(uid);
  return profile ? profile.medicalHistory || [] : [];
}

async function listMyReminders(uid) {
  const profile = await getMe(uid);
  return profile ? profile.reminders || [] : [];
}

async function listMyReports(uid) {
  const profile = await getMe(uid);
  return profile ? profile.reports || [] : [];
}

async function addConsultation(patientId, payload = {}) {
  const patient = await findPatient(patientId);
  if (!patient) {
    throw createHttpError(404, "Patient not found");
  }

  const diagnosis = String(payload.diagnosis || "").trim();
  if (!diagnosis) {
    throw createHttpError(400, "Diagnosis is required");
  }

  const consultation = {
    id: `cons-${Date.now()}`,
    date: payload.date || new Date().toISOString().slice(0, 10),
    doctorId: payload.doctorId || null,
    reason: String(payload.reason || "").trim(),
    diagnosis,
    prescription: String(payload.prescription || "").trim(),
    notes: String(payload.notes || "").trim(),
    status: "completed",
  };

  const newHistory = [
    {
      date: consultation.date,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription || "No prescription note",
      doctorId: consultation.doctorId,
    },
    ...(patient.medicalHistory || []),
  ];

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    await db.updateDocument(dbId, "patients", patientId, {
      medicalHistory: JSON.stringify(newHistory),
    });
  } else {
    patient.medicalHistory = newHistory;
  }

  return consultation;
}

async function addReminder(patientId, payload = {}) {
  const patient = await findPatient(patientId);
  if (!patient) {
    throw createHttpError(404, "Patient not found");
  }

  const message = String(payload.message || "").trim();
  if (!message) {
    throw createHttpError(400, "Reminder message is required");
  }

  const followUpDate = String(payload.followUpDate || "").trim();
  if (!followUpDate) {
    throw createHttpError(400, "Follow-up date is required");
  }

  const reminder = {
    id: `rem-${Date.now()}`,
    message,
    followUpDate,
    status: "pending",
    createdAt: new Date().toISOString(),
    doctorId: payload.doctorId || null,
  };

  const newReminders = [reminder, ...(patient.reminders || [])];

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    await db.updateDocument(dbId, "patients", patientId, {
      reminders: JSON.stringify(newReminders),
    });
  } else {
    patient.reminders = newReminders;
  }

  return reminder;
}

async function completeReminder(patientId, reminderId) {
  const patient = await findPatient(patientId);
  if (!patient) {
    throw createHttpError(404, "Patient not found");
  }

  const reminder = (patient.reminders || []).find((item) => item.id === reminderId);
  if (!reminder) {
    throw createHttpError(404, "Reminder not found");
  }

  reminder.status = "completed";
  reminder.completedAt = new Date().toISOString();

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    await db.updateDocument(dbId, "patients", patientId, {
      reminders: JSON.stringify(patient.reminders),
    });
  }

  return reminder;
}

module.exports = {
  addConsultation,
  addReminder,
  completeReminder,
  getMe,
  getPatientProfile,
  listMyConsultations,
  listMyReminders,
  listMyReports,
  upsertMyProfile,
};
