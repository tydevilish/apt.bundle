const pool = require("../database/pool");

exports.getAdminDashboard = async (req, res) => {
  try {
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "สำหรับผู้ดูแลระบบเท่านั้น" });
    }

    // Users
    const [[userCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users`
    );

    // Devices
    const [[deviceCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM devices`
    );

    // Logs
    const [[logCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM device_logs`
    );

    // Device online/offline
    const [deviceStatus] = await pool.query(`
      SELECT d.device_id,
             MAX(dl.updated_at) AS last_update
      FROM devices d
      LEFT JOIN device_logs dl ON dl.device_id = d.device_id
      GROUP BY d.device_id
    `);

    let online = 0;
    let offline = 0;

    const now = new Date();

    deviceStatus.forEach((row) => {
      if (!row.last_update) {
        offline++;
        return;
      }

      const diff = (now - new Date(row.last_update)) / 1000;
      diff <= 120 ? online++ : offline++;
    });

    return res.json({
      users: userCount.total,
      devices: deviceCount.total,
      logs: logCount.total,
      online,
      offline,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

exports.getUserDashboard = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch devices of user
    const [devices] = await pool.query(
      `SELECT device_id, device_name, device_site
       FROM devices
       WHERE user_id = ?`,
      [user_id]
    );

    if (devices.length === 0) {
      return res.json({
        hasDevices: false,
        message: "คุณยังไม่มีอุปกรณ์ในระบบ กรุณาเพิ่มอุปกรณ์",
      });
    }

    const results = [];

    for (let dev of devices) {
      // Latest log
      const [[latest]] = await pool.query(
        `SELECT * FROM device_logs
         WHERE device_id = ?
         ORDER BY updated_at DESC
         LIMIT 1`,
        [dev.device_id]
      );

      // Graph data (latest 50)
      const [logs] = await pool.query(
        `SELECT * FROM device_logs
         WHERE device_id = ?
         ORDER BY updated_at DESC
         LIMIT 50`,
        [dev.device_id]
      );

      // Online check
      let status = "offline";
      if (latest) {
        const diff = (Date.now() - new Date(latest.updated_at)) / 1000;
        if (diff <= 120) status = "online";
      }

      results.push({
        ...dev,
        status,
        latest: latest || null,
        logs,
      });
    }

    return res.json({
      hasDevices: true,
      devices: results,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

exports.getUser2Dashboard = async (req, res) => {
  try {
    return res.json({
      hasDevices: false,
      message: "บัญชีของคุณยังไม่สามารถใช้งานอุปกรณ์ได้ กรุณาเพิ่มอุปกรณ์",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};
