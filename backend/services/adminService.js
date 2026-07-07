const { doctors, hospitals } = require("../data/phase2Seed");
const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId, sdk } = require("../config/appwrite");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueId(base, collectionName, fallbackList) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    let currentId = base;
    let counter = 2;
    while (true) {
      try {
        await db.getDocument(dbId, collectionName, currentId);
        currentId = `${base}-${counter}`;
        counter++;
      } catch (e) {
        if (e.code === 404) return currentId;
        throw e;
      }
    }
  }

  const ids = new Set(fallbackList.map((item) => item.id));
  if (!ids.has(base)) return base;
  let counter = 2;
  while (ids.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

async function listHospitals() {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "hospitals");
    return res.documents.map((doc) => ({ id: doc.$id, ...doc }));
  }
  return hospitals;
}

async function findHospital(id) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doc = await db.getDocument(dbId, "hospitals", id);
      return { id: doc.$id, ...doc };
    } catch (e) {
      throw createHttpError(404, "Hospital not found");
    }
  }

  const hospital = hospitals.find((item) => item.id === id);
  if (!hospital) {
    throw createHttpError(404, "Hospital not found");
  }
  return hospital;
}

async function createHospital(payload = {}) {
  const name = String(payload.name || "").trim();
  if (!name) {
    throw createHttpError(400, "Hospital name is required");
  }
  if (!Array.isArray(payload.specialties) || payload.specialties.length === 0) {
    throw createHttpError(400, "At least one specialty is required");
  }

  const id = await ensureUniqueId(slugify(name), "hospitals", hospitals);

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const doc = await db.createDocument(dbId, "hospitals", id, {
      name,
      address: String(payload.address || "").trim(),
      latitude: payload.location?.lat === undefined ? 0 : Number(payload.location.lat),
      longitude: payload.location?.lng === undefined ? 0 : Number(payload.location.lng),
      phone: String(payload.phone || "").trim(),
      open_time: payload.timings?.open || "09:00",
      close_time: payload.timings?.close || "21:00",
      rating: Number(payload.rating) || 5.0,
      totalRatings: Number(payload.totalRatings) || 0,
      isActive: payload.isActive !== false,
    });
    return { id: doc.$id, ...doc };
  }

  const hospital = {
    id,
    name,
    address: String(payload.address || "").trim(),
    location: payload.location || { lat: 0, lng: 0 },
    phone: String(payload.phone || "").trim(),
    timings: payload.timings || { open: "09:00", close: "21:00" },
    specialties: payload.specialties,
    photos: Array.isArray(payload.photos) ? payload.photos : [],
    rating: Number(payload.rating) || 0,
    totalRatings: Number(payload.totalRatings) || 0,
    isActive: payload.isActive !== false,
  };

  hospitals.push(hospital);
  return hospital;
}

async function updateHospital(id, payload = {}) {
  const hospital = await findHospital(id);

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const updatePayload = {};
    if (payload.name !== undefined) updatePayload.name = String(payload.name).trim();
    if (payload.address !== undefined) updatePayload.address = String(payload.address).trim();
    if (payload.location?.lat !== undefined) updatePayload.latitude = Number(payload.location.lat);
    if (payload.location?.lng !== undefined) updatePayload.longitude = Number(payload.location.lng);
    if (payload.phone !== undefined) updatePayload.phone = String(payload.phone).trim();
    if (payload.timings?.open !== undefined) updatePayload.open_time = payload.timings.open;
    if (payload.timings?.close !== undefined) updatePayload.close_time = payload.timings.close;
    if (payload.rating !== undefined) updatePayload.rating = Number(payload.rating);
    if (payload.totalRatings !== undefined) updatePayload.totalRatings = Number(payload.totalRatings);
    if (payload.isActive !== undefined) updatePayload.isActive = payload.isActive !== false;

    const doc = await db.updateDocument(dbId, "hospitals", id, updatePayload);
    return { id: doc.$id, ...doc };
  }

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw createHttpError(400, "Hospital name cannot be empty");
    }
    hospital.name = name;
  }

  const HOSPITAL_FIELDS = [
    "address",
    "location",
    "phone",
    "timings",
    "specialties",
    "photos",
    "rating",
    "totalRatings",
    "isActive",
  ];

  for (const key of HOSPITAL_FIELDS) {
    if (payload[key] !== undefined) {
      hospital[key] = payload[key];
    }
  }

  return hospital;
}

async function deleteHospital(id) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const doctorsRes = await db.listDocuments(dbId, "doctors", [
      sdk.Query.equal("hospitalId", id)
    ]);
    for (const doc of doctorsRes.documents) {
      await db.deleteDocument(dbId, "doctors", doc.$id);
    }
    await db.deleteDocument(dbId, "hospitals", id);
    return { id };
  }

  const index = hospitals.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createHttpError(404, "Hospital not found");
  }

  for (let i = doctors.length - 1; i >= 0; i -= 1) {
    if (doctors[i].hospitalId === id) {
      doctors.splice(i, 1);
    }
  }

  return hospitals.splice(index, 1)[0];
}

async function listDoctors() {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const res = await db.listDocuments(dbId, "doctors");
    return res.documents.map((doc) => ({
      id: doc.$id,
      ...doc,
      languages: doc.languages.split(", ").map((l) => l.trim()),
      schedule: JSON.parse(doc.schedule || "{}"),
    }));
  }
  return doctors;
}

async function findDoctor(id) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    try {
      const doc = await db.getDocument(dbId, "doctors", id);
      return {
        id: doc.$id,
        ...doc,
        languages: doc.languages.split(", ").map((l) => l.trim()),
        schedule: JSON.parse(doc.schedule || "{}"),
      };
    } catch (e) {
      throw createHttpError(404, "Doctor not found");
    }
  }

  const doctor = doctors.find((item) => item.id === id);
  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }
  return doctor;
}

async function createDoctor(payload = {}) {
  const name = String(payload.name || "").trim();
  if (!name) {
    throw createHttpError(400, "Doctor name is required");
  }
  if (!payload.email || !String(payload.email).trim()) {
    throw createHttpError(400, "Doctor login email is required");
  }
  if (!payload.hospitalId) {
    throw createHttpError(400, "hospitalId is required");
  }
  await findHospital(payload.hospitalId);
  if (!payload.specialty) {
    throw createHttpError(400, "Specialty is required");
  }

  const id = await ensureUniqueId(slugify(name), "doctors", doctors);

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const doc = await db.createDocument(dbId, "doctors", id, {
      hospitalId: payload.hospitalId,
      name,
      email: String(payload.email).trim().toLowerCase(),
      specialty: payload.specialty,
      qualification: String(payload.qualification || "").trim(),
      experience: Number(payload.experience) || 0,
      languages: Array.isArray(payload.languages) ? payload.languages.join(", ") : String(payload.languages || ""),
      fee: Number(payload.fee) || 0,
      bio: String(payload.bio || "").trim(),
      schedule: JSON.stringify(payload.schedule || {}),
      rating: Number(payload.rating) || 5.0,
      isActive: payload.isActive !== false,
    });
    return {
      id: doc.$id,
      ...doc,
      languages: doc.languages.split(", ").map((l) => l.trim()),
      schedule: JSON.parse(doc.schedule || "{}"),
    };
  }

  const doctor = {
    id,
    hospitalId: payload.hospitalId,
    name,
    email: String(payload.email).trim().toLowerCase(),
    specialty: payload.specialty,
    qualification: String(payload.qualification || "").trim(),
    experience: Number(payload.experience) || 0,
    languages: Array.isArray(payload.languages) ? payload.languages : [],
    fee: Number(payload.fee) || 0,
    photo: payload.photo || "",
    bio: String(payload.bio || "").trim(),
    schedule: payload.schedule && typeof payload.schedule === "object" ? payload.schedule : {},
    rating: Number(payload.rating) || 0,
    totalRatings: Number(payload.totalRatings) || 0,
    isActive: payload.isActive !== false,
  };

  doctors.push(doctor);
  return doctor;
}

async function updateDoctor(id, payload = {}) {
  const doctor = await findDoctor(id);

  if (payload.hospitalId !== undefined) {
    await findHospital(payload.hospitalId);
  }

  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    const updatePayload = {};
    if (payload.hospitalId !== undefined) updatePayload.hospitalId = payload.hospitalId;
    if (payload.name !== undefined) updatePayload.name = String(payload.name).trim();
    if (payload.email !== undefined) updatePayload.email = String(payload.email).trim().toLowerCase();
    if (payload.specialty !== undefined) updatePayload.specialty = payload.specialty;
    if (payload.qualification !== undefined) updatePayload.qualification = String(payload.qualification).trim();
    if (payload.experience !== undefined) updatePayload.experience = Number(payload.experience);
    if (payload.languages !== undefined) {
      updatePayload.languages = Array.isArray(payload.languages) ? payload.languages.join(", ") : String(payload.languages);
    }
    if (payload.fee !== undefined) updatePayload.fee = Number(payload.fee);
    if (payload.bio !== undefined) updatePayload.bio = String(payload.bio).trim();
    if (payload.schedule !== undefined) updatePayload.schedule = JSON.stringify(payload.schedule);
    if (payload.rating !== undefined) updatePayload.rating = Number(payload.rating);
    if (payload.isActive !== undefined) updatePayload.isActive = payload.isActive !== false;

    const doc = await db.updateDocument(dbId, "doctors", id, updatePayload);
    return {
      id: doc.$id,
      ...doc,
      languages: doc.languages.split(", ").map((l) => l.trim()),
      schedule: JSON.parse(doc.schedule || "{}"),
    };
  }

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw createHttpError(400, "Doctor name cannot be empty");
    }
    doctor.name = name;
  }

  if (payload.email !== undefined) {
    doctor.email = String(payload.email).trim().toLowerCase();
  }

  const DOCTOR_FIELDS = [
    "hospitalId",
    "specialty",
    "qualification",
    "experience",
    "languages",
    "fee",
    "photo",
    "bio",
    "schedule",
    "rating",
    "totalRatings",
    "isActive",
  ];

  for (const key of DOCTOR_FIELDS) {
    if (payload[key] !== undefined) {
      doctor[key] = payload[key];
    }
  }

  return doctor;
}

async function deleteDoctor(id) {
  if (isAppwriteAvailable()) {
    const db = getAppwriteDatabases();
    const dbId = getDatabaseId();
    await db.deleteDocument(dbId, "doctors", id);
    return { id };
  }

  const index = doctors.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createHttpError(404, "Doctor not found");
  }
  return doctors.splice(index, 1)[0];
}

module.exports = {
  createDoctor,
  createHospital,
  deleteDoctor,
  deleteHospital,
  findDoctor,
  findHospital,
  listDoctors,
  listHospitals,
  updateDoctor,
  updateHospital,
};
