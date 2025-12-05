const pool = require("../database/pool");

/* ============================================================
   GET ALL DEVICES
   - user1/user2 → เห็นเฉพาะของตัวเอง
   - admin → เห็นทุกอุปกรณ์
============================================================ */
exports.getDevices = async (req, res) => {
  try {
    const { user_id, role } = req.user;

    let query = `
      SELECT device_id, device_name, device_site, user_id, created_at
      FROM devices
    `;
    let params = [];

    if (role !== "admin") {
      query += " WHERE user_id = ?";
      params.push(user_id);
    }

    const [rows] = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

/* ============================================================
   CREATE DEVICE
   - user → เข้าของตัวเองเสมอ
   - admin → ใส่ user_id ของใครก็ได้
   + อัปเดต role อัตโนมัติ
============================================================ */
exports.createDevice = async (req, res) => {
  try {
    const role = req.user.role;
    const user_id = role === "admin" ? req.body.user_id : req.user.user_id;

    const { device_id, device_name, device_site } = req.body;

    if (!/^[0-9]+$/.test(device_id)) {
      return res
        .status(400)
        .json({ message: "หมายเลขอุปกรณ์ต้องเป็นตัวเลขเท่านั้น" });
    }

    if (!device_id || !device_name || !device_site) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    const [exist] = await pool.query(
      "SELECT * FROM devices WHERE device_id = ?",
      [device_id]
    );

    if (exist.length > 0) {
      return res
        .status(400)
        .json({ message: "หมายเลขอุปกรณ์นี้ถูกลงทะเบียนแล้ว" });
    }

    await pool.query(
      `INSERT INTO devices (device_id, device_name, device_site, user_id)
       VALUES (?, ?, ?, ?)`,
      [device_id, device_name, device_site, user_id]
    );

    //⭐ อัปเดต role ของ user (สำหรับ admin และ user ทั่วไป)
    const [count] = await pool.query(
      "SELECT COUNT(*) AS total FROM devices WHERE user_id = ?",
      [user_id]
    );

    await pool.query("UPDATE users SET role = ? WHERE user_id = ?", [
      count[0].total > 0 ? "user1" : "user2",
      user_id,
    ]);

    res.json({ message: "ลงทะเบียนอุปกรณ์สำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

/* ============================================================
   UPDATE DEVICE
   - user → แก้เฉพาะของตัวเอง
   - admin → แก้ได้ทุกอุปกรณ์ + ย้าย owner ได้
   + อัปเดต role ทั้ง owner เก่าและใหม่
============================================================ */
exports.updateDevice = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const device_id = req.params.id;
    const { device_name, device_site, new_user_id } = req.body;

    // เช็ค owner ถ้าไม่ใช่ admin
    if (role !== "admin") {
      const [check] = await pool.query(
        "SELECT * FROM devices WHERE device_id = ? AND user_id = ?",
        [device_id, user_id]
      );

      if (check.length === 0) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์แก้อุปกรณ์นี้" });
      }
    }

    // หาเจ้าของเดิม
    const [oldOwnerQuery] = await pool.query(
      "SELECT user_id FROM devices WHERE device_id = ?",
      [device_id]
    );

    const oldOwner = oldOwnerQuery.length ? oldOwnerQuery[0].user_id : null;

    // UPDATE device + owner (ถ้ามีการย้าย)
    let updateOwnerQuery = "";
    let ownerParams = [];

    if (role === "admin" && new_user_id) {
      updateOwnerQuery = ", user_id = ?";
      ownerParams.push(new_user_id);
    }

    await pool.query(
      `
        UPDATE devices
        SET device_name = ?, device_site = ?
        ${updateOwnerQuery}
        WHERE device_id = ?
      `,
      [device_name, device_site, ...ownerParams, device_id]
    );

    //⭐ อัปเดต role ของ owner เก่า
    if (
      role === "admin" &&
      oldOwner &&
      new_user_id &&
      oldOwner !== new_user_id
    ) {
      const [countOld] = await pool.query(
        "SELECT COUNT(*) AS total FROM devices WHERE user_id = ?",
        [oldOwner]
      );

      await pool.query("UPDATE users SET role = ? WHERE user_id = ?", [
        countOld[0].total === 0 ? "user2" : "user1",
        oldOwner,
      ]);

      //⭐ อัปเดต role ของ owner ใหม่
      const [countNew] = await pool.query(
        "SELECT COUNT(*) AS total FROM devices WHERE user_id = ?",
        [new_user_id]
      );

      await pool.query("UPDATE users SET role = ? WHERE user_id = ?", [
        countNew[0].total > 0 ? "user1" : "user2",
        new_user_id,
      ]);
    }

    res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

/* ============================================================
   DELETE DEVICE
   - user → ลบเฉพาะของตัวเอง
   - admin → ลบอุปกรณ์ใครก็ได้
   + อัปเดต role ของเจ้าของอุปกรณ์หลังลบ
============================================================ */
exports.deleteDevice = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const device_id = req.params.id;

    let owner_id = user_id;

    if (role !== "admin") {
      const [check] = await pool.query(
        "SELECT * FROM devices WHERE device_id = ? AND user_id = ?",
        [device_id, user_id]
      );

      if (check.length === 0) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์ลบอุปกรณ์นี้" });
      }
    } else {
      const [owner] = await pool.query(
        "SELECT user_id FROM devices WHERE device_id = ?",
        [device_id]
      );
      owner_id = owner.length > 0 ? owner[0].user_id : null;
    }

    await pool.query("DELETE FROM devices WHERE device_id = ?", [device_id]);

    //⭐ ปรับ role ของเจ้าของอุปกรณ์หลังลบ
    if (owner_id) {
      const [count] = await pool.query(
        "SELECT COUNT(*) AS total FROM devices WHERE user_id = ?",
        [owner_id]
      );

      await pool.query("UPDATE users SET role = ? WHERE user_id = ?", [
        count[0].total === 0 ? "user2" : "user1",
        owner_id,
      ]);
    }

    res.json({ message: "ลบอุปกรณ์สำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

/* ============================================================
   GET DEVICE DETAIL
   - user → ดูได้เฉพาะของตัวเอง
   - admin → ดูได้ทุกอุปกรณ์
============================================================ */
exports.getDeviceDetail = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const device_id = req.params.id;

    let params = [device_id];
    let condition = "";

    if (role !== "admin") {
      condition = " AND user_id = ?";
      params.push(user_id);
    }

    const [device] = await pool.query(
      `SELECT device_id, device_name, device_site, user_id, created_at
       FROM devices
       WHERE device_id = ? ${condition}`,
      params
    );

    if (device.length === 0) {
      return res.status(404).json({ message: "ไม่พบอุปกรณ์นี้" });
    }

    const [logs] = await pool.query(
      `SELECT log_id, temp, humidity, pressure, updated_at
       FROM device_logs
       WHERE device_id = ?
       ORDER BY updated_at DESC`,
      [device_id]
    );

    res.json({
      device: device[0],
      logs: logs,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};
