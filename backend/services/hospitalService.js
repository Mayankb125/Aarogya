const { doctors, hospitals } = require("../data/phase2Seed");
const { matchSymptom } = require("./symptomService");
const { generateSlotsForDoctor, getNextDates } = require("../utils/slotGenerator");
const { getBookedSlotIds } = require("./bookingStore");
const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId, sdk } = require("../config/appwrite");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getDoctorsForHospital(hospitalId, specialty) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const queries = [
      sdk.Query.equal("hospitalId", hospitalId),
      sdk.Query.equal("isActive", true),
    ];
    if (specialty) {
      queries.push(sdk.Query.equal("specialty", specialty));
    }
    const res = await db.listDocuments(dbId, "doctors", queries);
    return res.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
      languages: doc.languages.split(", ").map((l) => l.trim()),
      schedule: JSON.parse(doc.schedule),
    }));
  }

  return doctors.filter((doctor) => {
    const specialtyMatches = !specialty || doctor.specialty === specialty;
    return doctor.hospitalId === hospitalId && doctor.isActive && specialtyMatches;
  });
}

async function getEarliestSlotForDoctors(hospitalDoctors) {
  const bookedSlotIds = await getBookedSlotIds();
  const upcomingDates = getNextDates(7);

  for (const date of upcomingDates) {
    for (const doctor of hospitalDoctors) {
      const slot = generateSlotsForDoctor(doctor, date, bookedSlotIds).find(
        (candidate) => candidate.status === "available",
      );

      if (slot) {
        return `${slot.date} ${slot.time}`;
      }
    }
  }

  return null;
}

async function searchHospitals({ query = "", specialty = "" } = {}) {
  const symptomMatch = specialty ? { specialty } : matchSymptom(query);
  const resolvedSpecialty = symptomMatch.specialty;

  let activeHospitals = [];
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "hospitals", [
      sdk.Query.equal("isActive", true)
    ]);
    activeHospitals = res.documents;
  } else {
    activeHospitals = hospitals.filter((hospital) => hospital.isActive);
  }

  const results = [];
  for (const hospital of activeHospitals) {
    const matchingDoctors = await getDoctorsForHospital(hospital.$id || hospital.id, resolvedSpecialty);
    const earliestSlot = await getEarliestSlotForDoctors(matchingDoctors);
    
    results.push({
      ...hospital,
      id: hospital.$id || hospital.id,
      matchingSpecialty: resolvedSpecialty,
      doctorsAvailableToday: matchingDoctors.length,
      earliestSlot,
    });
  }

  const filteredResults = results.filter((hospital) => hospital.doctorsAvailableToday > 0);

  return {
    query,
    specialty: resolvedSpecialty,
    matchedKeyword: symptomMatch.matchedKeyword || null,
    results: filteredResults,
  };
}

async function getHospitalDetail(id, specialty = "") {
  let hospital = null;
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doc = await db.getDocument(dbId, "hospitals", id);
      if (doc.isActive) hospital = doc;
    } catch (e) {
      // Ignored, handled below
    }
  } else {
    hospital = hospitals.find((item) => item.id === id && item.isActive);
  }

  if (!hospital) {
    throw createHttpError(404, "Hospital not found");
  }

  const matchingDoctors = await getDoctorsForHospital(id, specialty);
  let otherDoctors = [];
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "doctors", [
      sdk.Query.equal("hospitalId", id),
      sdk.Query.equal("isActive", true),
    ]);
    const allDoctors = res.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
      languages: doc.languages.split(", ").map((l) => l.trim()),
      schedule: JSON.parse(doc.schedule),
    }));
    otherDoctors = allDoctors.filter((doc) => doc.specialty !== specialty);
  } else {
    otherDoctors = doctors.filter(
      (doctor) => doctor.hospitalId === id && doctor.isActive && doctor.specialty !== specialty,
    );
  }

  return {
    ...hospital,
    id: hospital.$id || hospital.id,
    matchingSpecialty: specialty || null,
    doctors: specialty ? matchingDoctors : await getDoctorsForHospital(id),
    otherDoctors,
  };
}

module.exports = {
  getHospitalDetail,
  searchHospitals,
};
