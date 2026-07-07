const express = require("express");

const {
  confirmArrival,
  confirmBooking,
  createBooking,
  getBookingDetail,
  listPendingBookings,
  searchBookings,
} = require("../services/bookingService");
const { getQueueState } = require("../services/queueService");
const { getIo } = require("../sockets/socketManager");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await searchBookings(req.query.q));
  } catch (error) {
    next(error);
  }
});

router.get("/pending", async (_req, res, next) => {
  try {
    res.json(await listPendingBookings());
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await createBooking(req.body));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getBookingDetail(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/arrive", async (req, res, next) => {
  try {
    res.json(await confirmArrival(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/confirm", async (req, res, next) => {
  try {
    const booking = await confirmBooking(req.params.id);
    const io = getIo();
    if (io) {
      const state = await getQueueState();
      io.emit("queue:updated", state);
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
