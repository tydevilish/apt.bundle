const pool = require("../database/pool");
const path = require("path");
const bcrypt = require("bcryptjs");

// =============================
// GET PROFILE
// =============================
exports.getProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      "SELECT user_id, username, email, role, profile_image FROM users WHERE user_id = ?",
      [user_id]
    );

    return res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

// =============================
// UPDATE PROFILE
// =============================
exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { username, email, password } = req.body;

    // Check required fields
    if (!username || !email) {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    // Check duplicate username/email from other users
    const [exists] = await pool.query(
      "SELECT user_id FROM users WHERE (username = ? OR email = ?) AND user_id != ?",
      [username, email, user_id]
    );

    if (exists.length > 0) {
      return res.status(400).json({
        message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว",
      });
    }

    // Profile image (from multer file upload)
    const profile_image = req.file ? req.file.filename : null;

    // Base update query
    let query = `
      UPDATE users
      SET username = ?, 
          email = ?, 
          profile_image = COALESCE(?, profile_image)
    `;

    const params = [username, email, profile_image];
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE user_id = ?`;
    params.push(user_id);

    await pool.query(query, params);

    return res.status(200).json({
      message: "อัปเดตข้อมูลสำเร็จ",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};
