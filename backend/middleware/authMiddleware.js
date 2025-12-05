const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "ไม่พบ Authorization Header" });
  }
  const parts = header.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ message: "รูปแบบ Token ไม่ถูกต้อง (ต้องเป็น 'Bearer <token>')" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token หมดอายุแล้ว" });
    }
    res.status(403).json({ message: "โทเคนของคุณไม่ถูกต้อง" });
  }
};
