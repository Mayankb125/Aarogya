const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function toMinutes(time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getNextDates(days = 7) {
  return Array.from({ length: days }, (_unused, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return getDateKey(date);
  });
}

function generateSlotsForDoctor(doctor, dateKey, bookedSlotIds = new Set()) {
  const date = new Date(`${dateKey}T00:00:00`);
  const dayName = DAY_NAMES[date.getDay()];
  const schedule = doctor.schedule?.[dayName];

  if (!schedule) {
    return [];
  }

  const start = toMinutes(schedule.start);
  const end = toMinutes(schedule.end);
  const interval = 60 / Number(schedule.slotsPerHour || 4);
  const slots = [];

  // Slots are derived from doctor schedule so admin only manages working hours.
  for (let cursor = start; cursor < end; cursor += interval) {
    const time = toTimeLabel(cursor);
    const id = `${doctor.id}-${dateKey}-${time.replace(":", "")}`;
    slots.push({
      id,
      doctorId: doctor.id,
      hospitalId: doctor.hospitalId,
      date: dateKey,
      time,
      status: bookedSlotIds.has(id) ? "booked" : "available",
      bookingId: null,
    });
  }

  return slots;
}

module.exports = {
  generateSlotsForDoctor,
  getNextDates,
};
