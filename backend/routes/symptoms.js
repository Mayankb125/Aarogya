const express = require("express");

const { matchSymptom } = require("../services/symptomService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(matchSymptom(req.query.q));
});

module.exports = router;
