const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const doctorRoutes = require("./routes/doctors");
const hospitalRoutes = require("./routes/hospitals");
const patientRoutes = require("./routes/patients");
const queueRoutes = require("./routes/queue");
const symptomRoutes = require("./routes/symptoms");
const { setupSocketServer } = require("./sockets/socketManager");
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
if (CLIENT_URL && !allowedOrigins.includes(CLIENT_URL)) {
  allowedOrigins.push(CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || origin.startsWith("http://localhost:");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"), false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "aarogya-backend" });
});

app.use("/api/queue", queueRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

setupSocketServer(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`Queue Cure backend running on port ${PORT}`);
});
