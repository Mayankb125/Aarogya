const { getAdminAuth, isFirebaseAvailable } = require("../config/firebase");
const { getRoleFromEmail } = require("../config/roles");
const { isAppwriteAvailable, getAppwriteDatabases, getDatabaseId, sdk } = require("../config/appwrite");

// Verifies a Firebase ID token sent as `Authorization: Bearer <token>`.
function getUidFromToken(token) {
  if (!token) {
    const error = new Error("Authorization token is required");
    error.statusCode = 401;
    throw error;
  }

  return getAdminAuth()
    .verifyIdToken(token)
    .catch((verifyError) => {
      const error = new Error(verifyError.message || "Invalid Firebase token");
      error.statusCode = 401;
      throw error;
    });
}

async function resolveRoleAndIds(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  
  if (!cleanEmail) {
    return { role: "patient" };
  }

  // 1. Check Admin (Strictly admin@aarogya.in only)
  if (cleanEmail === "admin@aarogya.in") {
    return { role: "admin" };
  }

  // 2. Check Doctor in Appwrite
  if (isAppwriteAvailable()) {
    try {
      const db = getAppwriteDatabases();
      const dbId = getDatabaseId();
      const res = await db.listDocuments(dbId, "doctors", [
        sdk.Query.equal("email", cleanEmail),
        sdk.Query.equal("isActive", true)
      ]);
      if (res.documents.length > 0) {
        const doctorDoc = res.documents[0];
        return {
          role: "doctor",
          doctorId: doctorDoc.$id,
          hospitalId: doctorDoc.hospitalId,
          name: doctorDoc.name
        };
      }
    } catch (err) {
      console.error("Failed to query doctor in auth middleware:", err);
    }
  }

  // 3. Fallback Check for receptionist and admin
  const legacyRole = getRoleFromEmail(cleanEmail);
  
  if (legacyRole === "receptionist") {
    return { role: "receptionist" };
  } else if (legacyRole === "admin") {
    return { role: "admin" };
  }

  return { role: "patient" };
}

// Express middleware. Skips auth in dev when Firebase Admin is unavailable
async function requireFirebaseAuth(req, _res, next) {
  if (!isFirebaseAvailable()) {
    const devEmail = process.env.DEV_MOCK_EMAIL;
    if (!devEmail) {
      return next(new Error("DEV_MOCK_EMAIL is not defined in the backend environment variables (.env)"));
    }
    const details = await resolveRoleAndIds(devEmail);
    req.user = { 
      uid: "dev-user", 
      email: devEmail, 
      name: details.name || "Dev User",
      role: details.role,
      doctorId: details.doctorId || "dr-priya-sharma",
      hospitalId: details.hospitalId || "city-care-andheri"
    };
    return next();
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  try {
    const decoded = await getUidFromToken(token);
    const details = await resolveRoleAndIds(decoded.email);

    let name = decoded.name || (decoded.email ? decoded.email.split("@")[0] : "Clinician");
    if (details.role === "doctor" && details.name) {
      name = details.name;
    } else if (details.role === "patient" && isAppwriteAvailable()) {
      try {
        const db = getAppwriteDatabases();
        const dbId = getDatabaseId();
        const patientDoc = await db.getDocument(dbId, "patients", decoded.uid);
        if (patientDoc && patientDoc.name) {
          name = patientDoc.name;
        }
      } catch (err) {
        // Patient has not onboarded yet
      }
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: name,
      role: details.role,
      doctorId: details.doctorId,
      hospitalId: details.hospitalId,
    };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireFirebaseAuth,
  getUidFromToken,
  isFirebaseAvailable,
};