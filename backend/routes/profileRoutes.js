const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const requireAuth = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/profileController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "profile_" + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("ไฟล์ภาพไม่ถูกต้อง"));
    }
    cb(null, true);
  }
});

router.get("/", requireAuth, getProfile);

router.put("/", requireAuth, upload.single("profile_image"), updateProfile);

module.exports = router;
