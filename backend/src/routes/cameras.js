const express = require("express");
const router = express.Router();
const {
  getAllCameras,
  addCamera,
  updateCamera,
  deleteCamera,
} = require("../controllers/cameraController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAllCameras);
router.post("/", authMiddleware, addCamera);
router.put("/:id", authMiddleware, updateCamera);
router.delete("/:id", authMiddleware, deleteCamera);

module.exports = router;