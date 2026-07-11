const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId, sdk } = require("../config/appwrite");

const bookings = [];
const bookedSlotIds = new Set();

async function listBookings() {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "bookings");
    return res.documents.map((doc) => ({ id: doc.$id, ...doc }));
  }
  return bookings;
}

async function getBookingById(id) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doc = await db.getDocument(dbId, "bookings", id);
      return { id: doc.$id, ...doc };
    } catch (e) {
      return null;
    }
  }
  return bookings.find((booking) => booking.id === id) || null;
}

async function saveBooking(booking) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const doc = await db.createDocument(dbId, "bookings", booking.id || sdk.ID.unique(), {
      doctorId: booking.doctorId,
      slotId: booking.slotId,
      patientName: booking.patientName,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      queuedAt: booking.queuedAt || null,
    });
    return { id: doc.$id, ...doc };
  }
  bookings.push(booking);
  bookedSlotIds.add(booking.slotId);
  return booking;
}

async function updateBooking(id, updates) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const allowedKeys = ["doctorId", "slotId", "patientName", "date", "time", "status", "queuedAt"];
      const cleanUpdates = {};
      for (const key of allowedKeys) {
        if (updates[key] !== undefined) {
          cleanUpdates[key] = updates[key];
        }
      }
      const doc = await db.updateDocument(dbId, "bookings", id, cleanUpdates);
      return { id: doc.$id, ...doc };
    } catch (e) {
      console.error("Appwrite updateBooking failed:", e);
      return null;
    }
  }
  const booking = bookings.find((b) => b.id === id);
  if (!booking) return null;
  Object.assign(booking, updates);
  return booking;
}

async function getBookedSlotIds() {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "bookings");
    return new Set(res.documents.map((doc) => doc.slotId));
  }
  return new Set(bookedSlotIds);
}

module.exports = {
  getBookedSlotIds,
  getBookingById,
  listBookings,
  saveBooking,
  updateBooking,
};
