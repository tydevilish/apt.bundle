const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const path = require("path");
const pool = require("./database/pool");

dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT;
app.listen(PORT, (req, res) => {
  console.log(`Backend is running on port : ${PORT}`);
});

app.get("/", (req, res) => {
  res.send(`Backend is running on port : ${PORT}`);
});

app.get("/ping", async (req, res) => {
  const [rows] = await pool.query("SELECT now() AS now");
  res.json({
    status: "ok",
    time: rows[0].now,
  });
});
