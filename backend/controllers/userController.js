const pool = require("../database/pool");
const bcrypt = require("bcryptjs");

// =============================
// GET ALL USERS
// =============================
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT user_id, username, email, role, profile_image FROM users"
    );
    res.json({ data: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

// =============================
// CREATE USER (ADMIN CREATE)
// =============================
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role)
      return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });

    // ตรวจสอบซ้ำ
    const [check] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (check.length > 0)
      return res.status(400).json({ message: "ชื่อผู้ใช้หรืออีเมลถูกใช้แล้ว" });

    // 🔐 ทำการ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, role]
    );

    res.json({ message: "เพิ่มผู้ใช้สำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

// =============================
// UPDATE USER
// =============================
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // กันไม่ให้แก้ตัวเองในหน้า Admin
    if (req.user.user_id == userId) {
      return res.status(403).json({
        message: "ไม่สามารถแก้ไขข้อมูลของตัวเองในหน้านี้",
      });
    }

    const { username, email, password, role } = req.body;

    if (!username || !email)
      return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });

    // ตรวจสอบซ้ำคนอื่น
    const [exists] = await pool.query(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND user_id != ?",
      [username, email, userId]
    );
    if (exists.length > 0)
      return res.status(400).json({ message: "ชื่อผู้ใช้หรืออีเมลถูกใช้แล้ว" });

    let hashedPassword = null;

    // 🔐 ถ้าผู้ใช้ใส่ password ใหม่ → hash ใหม่
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await pool.query(
      `UPDATE users SET 
        username = ?, 
        email = ?, 
        password = COALESCE(?, password), 
        role = ?
       WHERE user_id = ?`,
      [username, email, hashedPassword, role, userId]
    );

    res.json({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

// =============================
// DELETE USER
// =============================
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // กันไม่ให้ลบตัวเอง
    if (req.user.user_id == userId) {
      return res.status(403).json({
        message: "ไม่สามารถลบตัวเองได้",
      });
    }

    await pool.query("DELETE FROM users WHERE user_id = ?", [userId]);

    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};
