const sdk = require("node-appwrite");

let databases = null;

function isAppwriteAvailable() {
  return Boolean(
    process.env.APPWRITE_ENDPOINT &&
    process.env.APPWRITE_PROJECT_ID &&
    process.env.APPWRITE_API_KEY &&
    process.env.APPWRITE_DATABASE_ID
  );
}

function getAppwriteDatabases() {
  if (databases) {
    return databases;
  }

  if (!isAppwriteAvailable()) {
    throw new Error("Appwrite environment variables are missing from environment");
  }

  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  databases = new sdk.Databases(client);
  return databases;
}

function getDatabaseId() {
  return process.env.APPWRITE_DATABASE_ID || "aarogya_db";
}

module.exports = {
  isAppwriteAvailable,
  getAppwriteDatabases,
  getDatabaseId,
  sdk,
};
