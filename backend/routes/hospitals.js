const express = require("express");

const { getHospitalDetail, searchHospitals } = require("../services/hospitalService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await searchHospitals({ query: req.query.q, specialty: req.query.specialty }));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await getHospitalDetail(req.params.id, req.query.specialty));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
