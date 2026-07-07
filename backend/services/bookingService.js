const { doctors, hospitals, patients } = require("../data/phase2Seed");
const { getBookedSlotIds, getBookingById, listBookings, saveBooking, updateBooking } = require("./bookingStore");
const { getDoctorProfile, getDoctorSlots } = require("./doctorService");
const { addFromBooking } = require("./queueService");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getBookingDetail(id) {
  const booking = await getBookingById(id);

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  return enrichBooking(booking);
}

async function enrichBooking(booking) {
  if (!booking) return null;

  const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId } = require("../config/appwrite");
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doctorDoc = await db.getDocument(dbId, "doctors", booking.doctorId);
      const hospitalDoc = await db.getDocument(dbId, "hospitals", booking.hospitalId || doctorDoc.hospitalId);

      let patientDoc = null;
      try {
        patientDoc = await db.getDocument(dbId, "patients", booking.patientId);
      } catch (err) {
        // Patient may not be onboarded yet
      }

      return {
        ...booking,
        doctor: {
          ...doctorDoc,
          languages: doctorDoc.languages.split(", ").map((l) => l.trim()),
          schedule: JSON.parse(doctorDoc.schedule),
        },
        hospital: hospitalDoc,
        patient: patientDoc ? {
          ...patientDoc,
          medicalHistory: JSON.parse(patientDoc.medicalHistory || "[]"),
          reminders: JSON.parse(patientDoc.reminders || "[]"),
          reports: JSON.parse(patientDoc.reports || "[]"),
        } : null,
      };
    } catch (e) {
      console.error("Failed to enrich booking from Appwrite:", e);
    }
  }

  const doctor = doctors.find((item) => item.id === booking.doctorId);
  const hospital = hospitals.find((item) => item.id === (booking.hospitalId || doctor?.hospitalId));
  const patient = patients.find((item) => item.id === booking.patientId);

  return {
    ...booking,
    doctor,
    hospital,
    patient,
  };
}

async function createBooking(payload = {}) {
  const { doctorId, slotId, patientId = "patient-demo", patientName = "Rahul Mehta" } = payload;

  if (!doctorId || !slotId) {
    throw createHttpError(400, "doctorId and slotId are required");
  }

  const doctor = await getDoctorProfile(doctorId);
  const allSlots = (await getDoctorSlots(doctorId)).flatMap((day) => day.slots);
  const selectedSlot = allSlots.find((slot) => slot.id === slotId);

  if (!selectedSlot) {
    throw createHttpError(404, "Slot not found");
  }

  const bookedIds = await getBookedSlotIds();
  if (selectedSlot.status !== "available" || bookedIds.has(slotId)) {
    throw createHttpError(409, "Slot is already booked");
  }

  const booking = {
    id: `booking-${Date.now()}`,
    patientId,
    patientName,
    doctorId,
    hospitalId: doctor.hospitalId,
    slotId,
    date: selectedSlot.date,
    time: selectedSlot.time,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const saved = await saveBooking(booking);
  return enrichBooking(saved);
}

async function searchBookings(query = "") {
  const cleanQuery = String(query || "").trim().toLowerCase();

  const bookingsList = await listBookings();
  const filtered = bookingsList.filter((booking) => {
    if (!cleanQuery) {
      return true;
    }

    return (
      booking.id.toLowerCase().includes(cleanQuery) ||
      booking.patientName.toLowerCase().includes(cleanQuery)
    );
  });

  return Promise.all(filtered.map(enrichBooking));
}

async function confirmArrival(bookingId) {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  if (!["confirmed", "arrived"].includes(booking.status)) {
    throw createHttpError(409, "Booking cannot be checked in");
  }

  const updatedBooking = await updateBooking(bookingId, {
    status: "arrived",
    arrivedAt: new Date().toISOString(),
  });

  return enrichBooking(updatedBooking);
}

async function listPendingBookings() {
  const bookingsList = await listBookings();
  const filtered = bookingsList.filter((booking) => booking.status === "pending");
  return Promise.all(filtered.map(enrichBooking));
}

// Receptionist approves a pending booking and immediately pushes it into the live queue.
async function confirmBooking(bookingId) {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  if (booking.status !== "pending") {
    throw createHttpError(409, "Booking is not pending confirmation");
  }

  await updateBooking(bookingId, {
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
  });

  // addFromBooking pushes the patient into the queue and flips status to in_queue.
  // If it fails, roll back to pending so the receptionist can retry instead of
  // leaving the booking stuck as confirmed-but-not-queued.
  try {
    await addFromBooking(bookingId);
  } catch (queueError) {
    await updateBooking(bookingId, {
      status: "pending",
      confirmedAt: null,
    });
    throw queueError;
  }

  const latest = await getBookingById(bookingId);
  return enrichBooking(latest);
}

module.exports = {
  confirmArrival,
  confirmBooking,
  createBooking,
  getBookingDetail,
  listPendingBookings,
  searchBookings,
};
