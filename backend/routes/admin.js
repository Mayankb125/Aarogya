const express = require("express");

const {
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
} = require("../services/adminService");

const router = express.Router();

// Hospital onboarding
router.get("/hospitals", async (_req, res) => {
  res.json(await listHospitals());
});

router.get("/hospitals/:id", async (req, res, next) => {
  try {
    res.json(await findHospital(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post("/hospitals", async (req, res, next) => {
  try {
    res.status(201).json(await createHospital(req.body));
  } catch (error) {
    next(error);
  }
});

router.put("/hospitals/:id", async (req, res, next) => {
  try {
    res.json(await updateHospital(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

router.delete("/hospitals/:id", async (req, res, next) => {
  try {
    res.json(await deleteHospital(req.params.id));
  } catch (error) {
    next(error);
  }
});

// Doctor onboarding
router.get("/doctors", async (_req, res) => {
  res.json(await listDoctors());
});

router.get("/doctors/:id", async (req, res, next) => {
  try {
    res.json(await findDoctor(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post("/doctors", async (req, res, next) => {
  try {
    res.status(201).json(await createDoctor(req.body));
  } catch (error) {
    next(error);
  }
});

router.put("/doctors/:id", async (req, res, next) => {
  try {
    res.json(await updateDoctor(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

router.delete("/doctors/:id", async (req, res, next) => {
  try {
    res.json(await deleteDoctor(req.params.id));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
