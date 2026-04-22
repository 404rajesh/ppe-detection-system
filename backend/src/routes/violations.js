const express = require("express");
const router = express.Router();
const {
  getViolations,
  getViolationStats,
} = require("../controllers/violationController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getViolations);
router.get("/stats", authMiddleware, getViolationStats);

module.exports = router;