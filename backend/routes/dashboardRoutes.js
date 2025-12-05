const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAdminDashboard,
  getUserDashboard,
  getUser2Dashboard,
} = require("../controllers/dashboardController");

// Admin
router.get("/admin", requireAuth, requireAdmin, getAdminDashboard);

// User1 / User ที่มีอุปกรณ์
router.get("/user", requireAuth, getUserDashboard);

// User2
router.get("/user2", requireAuth, getUser2Dashboard);

module.exports = router;
