const express = require("express");
const router = express.Router();
const {
  saveDetection,
  getDetections,
} = require("../controllers/detectionController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, saveDetection);
router.get("/", authMiddleware, getDetections);

module.exports = router;