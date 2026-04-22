const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getComplianceTrend,
  getPPERules,
  updatePPERules,
} = require("../controllers/analyticsController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/stats", authMiddleware, getDashboardStats);
router.get("/compliance-trend", authMiddleware, getComplianceTrend);
router.get("/ppe-rules", authMiddleware, getPPERules);
router.put("/ppe-rules", authMiddleware, updatePPERules);

module.exports = router;