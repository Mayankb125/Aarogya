const { doctors, hospitals, patients } = require("../data/phase2Seed");
const { listBookings } = require("./bookingStore");
const { generateSlotsForDoctor, getNextDates } = require("../utils/slotGenerator");
const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId, sdk } = require("../config/appwrite");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getDoctorProfile(id) {
  if (isAppwriteAvailable()) {
    try {
      const db = getAppwriteDatabases();
      const dbId = getDatabaseId();
      const doc = await db.getDocument(dbId, "doctors", id);
      const hospital = await db.getDocument(dbId, "hospitals", doc.hospitalId);
      return {
        id: doc.$id,
        ...doc,
        languages: doc.languages.split(", ").map((l) => l.trim()),
        schedule: JSON.parse(doc.schedule),
        hospital: { id: hospital.$id, ...hospital },
      };
    } catch (e) {
      if (e.code === 404) throw createHttpError(404, "Doctor not found");
      throw e;
    }
  }

  const doctor = doctors.find((item) => item.id === id && item.isActive);

  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }

  const hospital = hospitals.find((item) => item.id === doctor.hospitalId);

  return {
    ...doctor,
    hospital,
  };
}

async function listDoctors() {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "doctors", [
      sdk.Query.equal("isActive", true)
    ]);
    return res.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
      languages: doc.languages.split(", ").map((l) => l.trim()),
      schedule: JSON.parse(doc.schedule),
    }));
  }

  return doctors.filter((item) => item.isActive);
}

async function getDoctorSlots(id) {
  const doctor = await getDoctorProfile(id);
  const { getBookedSlotIds } = require("./bookingStore");
  const bookedSlotIds = await getBookedSlotIds();

  return getNextDates(7).map((date) => ({
    date,
    slots: generateSlotsForDoctor(doctor, date, bookedSlotIds),
  }));
}

function formatDate(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Match a queue patient to a seeded patient record by name so the doctor can see prior history.
function lookupPatientHistory(name) {
  const cleanName = String(name || "").trim().toLowerCase();
  if (!cleanName) return null;

  const patient = patients.find(
    (item) => item.name.trim().toLowerCase() === cleanName,
  );

  if (!patient) return null;

  return {
    patientId: patient.id,
    age: patient.age,
    bloodGroup: patient.bloodGroup,
    phone: patient.phone,
    medicalHistory: patient.medicalHistory || [],
  };
}

async function getDoctorDashboard(id) {
  const doctor = await getDoctorProfile(id);
  const { getQueueState } = require("./queueService");

  const state = await getQueueState();
  const today = formatDate(0);
  const tomorrow = formatDate(1);

  // Only this doctor's bookings count toward their dashboard summary.
  const bookingsList = await listBookings();
  const todaysBookings = bookingsList
    .filter((booking) => booking.doctorId === id && booking.date === today)
    .map((booking) => enrichBooking(booking));
  const tomorrowsBookings = bookingsList
    .filter((booking) => booking.doctorId === id && booking.date === tomorrow)
    .map((booking) => enrichBooking(booking));

  const bookingSummary = {
    booked: todaysBookings.length,
    arrived: todaysBookings.filter((booking) => booking.status === "arrived").length,
    inQueue: todaysBookings.filter((booking) => booking.status === "in_queue").length,
    completed: todaysBookings.filter((booking) => booking.status === "completed").length,
    cancelled: todaysBookings.filter((booking) => booking.status === "cancelled").length,
    remaining: todaysBookings.filter((booking) =>
      ["pending", "confirmed"].includes(booking.status),
    ).length,
  };

  const currentPatient = state.currentToken && state.currentToken.doctorId === id
    ? {
        ...state.currentToken,
        medicalHistory: lookupPatientHistory(state.currentToken.name),
      }
    : null;

  const filteredQueue = state.queue.filter((patient) => patient.doctorId === id);

  // Next 3 patients waiting in this doctor's queue
  const upcomingPatients = filteredQueue.slice(0, 3).map((patient) => ({
    ...patient,
    medicalHistory: lookupPatientHistory(patient.name),
  }));

  return {
    doctor,
    currentPatient,
    upcomingPatients,
    queueLength: filteredQueue.length,
    avgConsultTime: state.avgConsultTime,
    todaysBookings,
    tomorrowsBookings,
    bookingSummary,
  };
}

function enrichBooking(booking) {
  const doctor = doctors.find((item) => item.id === booking.doctorId);
  const hospital = doctors.length && doctor
    ? hospitals.find((item) => item.id === doctor.hospitalId)
    : null;
  return {
    ...booking,
    doctor,
    hospital,
  };
}

module.exports = {
  getDoctorDashboard,
  getDoctorProfile,
  getDoctorSlots,
  listDoctors,
};
