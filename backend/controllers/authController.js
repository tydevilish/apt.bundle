const pool = require("../database/pool");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// =======================
// REGISTER
// =======================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    // Check duplicate
    const [findUser] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (findUser.length > 0) {
      return res.status(400).json({
        message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว",
      });
    }

    // 🔐 Hash password ก่อนบันทึก
    const hashPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashPassword, "user2"]
    );

    return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// =======================
// LOGIN
// =======================
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    const identifier = username || email;

    const [users] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = users[0];

    // 🔐 ตรวจสอบ password แบบเข้ารหัส
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // สร้าง token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// =======================
// GET ME
// =======================
exports.me = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      "SELECT user_id, username, email, role, profile_image FROM users WHERE user_id = ?",
      [user_id]
    );

    return res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "เซิร์ฟเวอร์ไม่ตอบสนอง" });
  }
};
