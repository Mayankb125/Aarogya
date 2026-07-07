const express = require("express");

const {
  addFromBooking,
  addPatient,
  callNextToken,
  getQueueState,
  resetQueue,
  updateAvgConsultTime,
} = require("../services/queueService");

const router = express.Router();

// REST routes mirror socket actions so Postman/manual testing can use same service layer.
router.get("/", async (_req, res, next) => {
  try {
    const state = await getQueueState();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post("/patients", async (req, res, next) => {
  try {
    const state = await addPatient(req.body);
    res.status(201).json(state);
  } catch (error) {
    next(error);
  }
});

router.post("/arrive", async (req, res, next) => {
  try {
    const state = await addFromBooking(req.body.bookingId);
    res.status(201).json(state);
  } catch (error) {
    next(error);
  }
});

router.post("/call-next", async (_req, res, next) => {
  try {
    const state = await callNextToken();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post("/reset", async (_req, res, next) => {
  try {
    const state = await resetQueue();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.patch("/avg-consult-time", async (req, res, next) => {
  try {
    const state = await updateAvgConsultTime(req.body.avgConsultTime);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
