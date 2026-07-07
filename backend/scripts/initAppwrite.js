const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });
const sdk = require("node-appwrite");
const { hospitals, doctors, patients } = require("../data/phase2Seed");

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "aarogya_db";

if (!endpoint || !projectId || !apiKey) {
  console.error("Error: Appwrite environment variables are missing in .env!");
  console.error("Ensure APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY are configured.");
  process.exit(1);
}

const client = new sdk.Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new sdk.Databases(client);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to poll Appwrite until all attributes are fully processed and ready
async function waitForAttributes(colId, keys) {
  console.log(`Waiting for attributes to build in collection "${colId}"...`);
  let attempts = 0;
  while (attempts < 30) {
    const col = await db.getCollection(databaseId, colId);
    const availableKeys = col.attributes
      .filter((attr) => attr.status === "available")
      .map((attr) => attr.key);
    
    const allReady = keys.every((key) => availableKeys.includes(key));
    if (allReady) {
      console.log(`Attributes for collection "${colId}" are ready!`);
      return;
    }
    await sleep(1000);
    attempts++;
  }
  throw new Error(`Timeout waiting for attributes in collection "${colId}"`);
}

async function run() {
  try {
    // 1. Delete database if it exists to ensure a clean idempotent recreate
    try {
      console.log(`Checking if database "${databaseId}" exists...`);
      await db.delete(databaseId);
      console.log(`Deleted existing database "${databaseId}" to perform fresh seeding.`);
      await sleep(2000);
    } catch (e) {
      // Database didn't exist, which is fine
    }

    // 2. Create the Database
    console.log(`Creating database "${databaseId}"...`);
    await db.create(databaseId, "Aarogya Database");
    await sleep(1000);

    // 3. Create Hospitals Collection
    console.log("Creating hospitals collection...");
    await db.createCollection(databaseId, "hospitals", "Hospitals");
    await db.createStringAttribute(databaseId, "hospitals", "name", 128, true);
    await db.createStringAttribute(databaseId, "hospitals", "address", 256, true);
    await db.createFloatAttribute(databaseId, "hospitals", "latitude", true);
    await db.createFloatAttribute(databaseId, "hospitals", "longitude", true);
    await db.createStringAttribute(databaseId, "hospitals", "phone", 20, true);
    await db.createStringAttribute(databaseId, "hospitals", "open_time", 5, true);
    await db.createStringAttribute(databaseId, "hospitals", "close_time", 5, true);
    await db.createFloatAttribute(databaseId, "hospitals", "rating", false, null, null, 5.0);
    await db.createIntegerAttribute(databaseId, "hospitals", "totalRatings", false, null, null, 0);
    await db.createBooleanAttribute(databaseId, "hospitals", "isActive", false, true);
    
    await waitForAttributes("hospitals", [
      "name", "address", "latitude", "longitude", "phone", "open_time", "close_time", "rating", "totalRatings", "isActive"
    ]);
    await sleep(3000);

    // 4. Create Doctors Collection
    console.log("Creating doctors collection...");
    await db.createCollection(databaseId, "doctors", "Doctors");
    await db.createStringAttribute(databaseId, "doctors", "hospitalId", 36, true);
    await db.createStringAttribute(databaseId, "doctors", "name", 128, true);
    await db.createStringAttribute(databaseId, "doctors", "email", 128, true);
    await db.createStringAttribute(databaseId, "doctors", "specialty", 64, true);
    await db.createStringAttribute(databaseId, "doctors", "qualification", 128, true);
    await db.createIntegerAttribute(databaseId, "doctors", "experience", true);
    await db.createIntegerAttribute(databaseId, "doctors", "fee", true);
    await db.createStringAttribute(databaseId, "doctors", "languages", 128, true);
    await db.createStringAttribute(databaseId, "doctors", "bio", 1000, false);
    await db.createFloatAttribute(databaseId, "doctors", "rating", false, null, null, 5.0);
    await db.createBooleanAttribute(databaseId, "doctors", "isActive", false, true);
    await db.createStringAttribute(databaseId, "doctors", "schedule", 2000, true); // JSON string

    await waitForAttributes("doctors", [
      "hospitalId", "name", "email", "specialty", "qualification", "experience", "fee", "languages", "bio", "rating", "isActive", "schedule"
    ]);
    await sleep(3000);

    // 5. Create Patients Collection
    console.log("Creating patients collection...");
    await db.createCollection(databaseId, "patients", "Patients");
    await db.createStringAttribute(databaseId, "patients", "name", 128, true);
    await db.createIntegerAttribute(databaseId, "patients", "age", true);
    await db.createStringAttribute(databaseId, "patients", "bloodGroup", 5, false);
    await db.createStringAttribute(databaseId, "patients", "phone", 20, true);
    await db.createStringAttribute(databaseId, "patients", "gender", 20, false, "Not specified");
    await db.createStringAttribute(databaseId, "patients", "address", 256, false);
    await db.createStringAttribute(databaseId, "patients", "emergencyContact", 256, false);
    await db.createStringAttribute(databaseId, "patients", "allergies", 256, false);
    await db.createStringAttribute(databaseId, "patients", "chronicConditions", 256, false);
    await db.createStringAttribute(databaseId, "patients", "medicalHistory", 20000, false); // JSON String of consults
    await db.createStringAttribute(databaseId, "patients", "reminders", 20000, false); // JSON String
    await db.createStringAttribute(databaseId, "patients", "reports", 20000, false); // JSON String
    await db.createStringAttribute(databaseId, "patients", "onboardedAt", 64, false); // ISO date string

    await waitForAttributes("patients", [
      "name", "age", "bloodGroup", "phone", "gender", "address", "medicalHistory", "reminders", "reports", "onboardedAt"
    ]);
    await sleep(3000);

    // 6. Create Bookings Collection
    console.log("Creating bookings collection...");
    await db.createCollection(databaseId, "bookings", "Bookings");
    await db.createStringAttribute(databaseId, "bookings", "doctorId", 36, true);
    await db.createStringAttribute(databaseId, "bookings", "slotId", 128, true);
    await db.createStringAttribute(databaseId, "bookings", "patientName", 128, true);
    await db.createStringAttribute(databaseId, "bookings", "date", 10, true);
    await db.createStringAttribute(databaseId, "bookings", "time", 5, true);
    await db.createEnumAttribute(databaseId, "bookings", "status", ["pending", "confirmed", "arrived", "completed", "cancelled"], true);
    await db.createStringAttribute(databaseId, "bookings", "queuedAt", 30, false);

    await waitForAttributes("bookings", [
      "doctorId", "slotId", "patientName", "date", "time", "status", "queuedAt"
    ]);
    await sleep(3000);

    // 7. Create Queues Collection
    console.log("Creating queues collection...");
    await db.createCollection(databaseId, "queues", "Queues");
    await db.createStringAttribute(databaseId, "queues", "queue", 20000, true); // JSON string
    await db.createStringAttribute(databaseId, "queues", "currentToken", 5000, false); // JSON string
    await db.createIntegerAttribute(databaseId, "queues", "lastTokenNumber", true);
    await db.createIntegerAttribute(databaseId, "queues", "avgConsultTime", true);

    await waitForAttributes("queues", [
      "queue", "currentToken", "lastTokenNumber", "avgConsultTime"
    ]);
    await sleep(3000);

    // 8. Seeding Data
    console.log("Database initialized. Seeding mock data...");

    // Seed Hospitals
    for (const h of hospitals) {
      console.log(`Seeding hospital: ${h.name}`);
      await db.createDocument(databaseId, "hospitals", h.id, {
        name: h.name,
        address: h.address,
        latitude: h.location.lat,
        longitude: h.location.lng,
        phone: h.phone,
        open_time: h.timings.open,
        close_time: h.timings.close,
        rating: h.rating,
        totalRatings: h.totalRatings,
        isActive: h.isActive
      });
    }

    // Seed Doctors
    for (const d of doctors) {
      console.log(`Seeding doctor: ${d.name}`);
      const hospital = hospitals.find(h => h.id === d.hospitalId);
      const cleanDoc = d.name.toLowerCase().replace("dr. ", "").replace(/[^a-z]/g, "");
      const cleanHosp = hospital ? hospital.name.toLowerCase().replace(/[^a-z]/g, "") : "clinic";
      const email = `${cleanDoc}@${cleanHosp}.com`;

      await db.createDocument(databaseId, "doctors", d.id, {
        hospitalId: d.hospitalId,
        name: d.name,
        email: email,
        specialty: d.specialty,
        qualification: d.qualification,
        experience: d.experience,
        fee: d.fee,
        languages: d.languages.join(", "),
        bio: d.bio,
        rating: d.rating,
        isActive: d.isActive,
        schedule: JSON.stringify(d.schedule)
      });
    }

    // Seed Patients
    for (const p of patients) {
      console.log(`Seeding patient profile: ${p.name}`);
      await db.createDocument(databaseId, "patients", p.id, {
        name: p.name,
        age: p.age,
        bloodGroup: p.bloodGroup,
        phone: p.phone,
        gender: p.gender || "Not specified",
        address: p.address || "",
        medicalHistory: JSON.stringify(p.medicalHistory || []),
        reminders: JSON.stringify(p.reminders || []),
        reports: JSON.stringify(p.reports || [])
      });
    }

    // Seed Default Queue Document
    console.log("Seeding default queue state...");
    await db.createDocument(databaseId, "queues", "default", {
      queue: JSON.stringify([]),
      currentToken: JSON.stringify(null),
      lastTokenNumber: 0,
      avgConsultTime: 5
    });

    console.log("Appwrite Database initialization and seeding completed successfully!");
  } catch (error) {
    console.error("Initialization script failed with error:", error);
    process.exit(1);
  }
}

run();
