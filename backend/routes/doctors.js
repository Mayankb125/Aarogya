const express = require("express");

const {
  getDoctorDashboard,
  getDoctorProfile,
  getDoctorSlots,
  listDoctors,
} = require("../services/doctorService");
const { updateDoctor } = require("../services/adminService");
const { requireFirebaseAuth } = require("../middleware/auth");

const router = express.Router();

// Get all active doctors
router.get("/", async (req, res, next) => {
  try {
    res.json(await listDoctors());
  } catch (error) {
    next(error);
  }
});

// Dashboard must sit above "/:id" so Express does not treat "dashboard" as an id.
router.get("/:id/dashboard", async (req, res, next) => {
  try {
    res.json(await getDoctorDashboard(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getDoctorProfile(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireFirebaseAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.doctorId !== req.params.id) {
      const err = new Error("Forbidden: You can only update your own profile");
      err.statusCode = 403;
      throw err;
    }
    const updated = await updateDoctor(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/slots", async (req, res, next) => {
  try {
    res.json(await getDoctorSlots(req.params.id));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
