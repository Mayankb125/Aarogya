const express = require("express");

const {
  addConsultation,
  addReminder,
  completeReminder,
  getMe,
  getPatientProfile,
  upsertMyProfile,
} = require("../services/patientService");
const { requireFirebaseAuth } = require("../middleware/auth");

const router = express.Router();

// Auth-required self-service routes must register BEFORE `/:id` so Express
// does not treat "me" as a patient id.
router.get("/me", requireFirebaseAuth, async (req, res, next) => {
  try {
    const patient = await getMe(req.user.uid);
    if (!patient) {
      res.status(404).json({ onboarded: false, message: "Patient has not onboarded yet" });
      return;
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

router.post("/me", requireFirebaseAuth, async (req, res, next) => {
  try {
    const patient = await upsertMyProfile(req.user.uid, {
      ...req.body,
      email: req.user.email,
    });
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

router.put("/me", requireFirebaseAuth, async (req, res, next) => {
  try {
    const patient = await upsertMyProfile(req.user.uid, {
      ...req.body,
      email: req.user.email,
    });
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

router.get("/", (_req, res) => {
  res.json(getPatientProfile());
});

router.get("/:id", (req, res, next) => {
  try {
    res.json(getPatientProfile(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/consultations", (req, res, next) => {
  try {
    res.status(201).json(addConsultation(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reminders", (req, res, next) => {
  try {
    res.status(201).json(addReminder(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/reminders/:reminderId", (req, res, next) => {
  try {
    res.json(completeReminder(req.params.id, req.params.reminderId));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
