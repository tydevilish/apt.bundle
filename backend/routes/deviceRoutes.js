const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceDetail,
} = require("../controllers/deviceController");

router.get("/", requireAuth, getDevices);
router.post("/", requireAuth, createDevice);
router.put("/:id", requireAuth, updateDevice);
router.delete("/:id", requireAuth, deleteDevice);
router.get("/:id/detail", requireAuth, getDeviceDetail);

module.exports = router;
