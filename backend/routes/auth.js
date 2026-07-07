const express = require("express");

const { requireFirebaseAuth } = require("../middleware/auth");

const router = express.Router();

// Returns the authenticated user profile derived from the Firebase ID token.
// Requires `Authorization: Bearer <idToken>` header. Skipped in dev when no
// service account is configured in the backend env.
router.get("/me", requireFirebaseAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;