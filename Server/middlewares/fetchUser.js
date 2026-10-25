const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "imovies_super_secret_jwt_key_2026";

const fetchUser = (req, res, next) => {
  // Get user from JWT token
  const token = req.header("auth-token") || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: Please authenticate using a valid token",
    });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token, please login again",
    });
  }
};

const verifyAdmin = (req, res, next) => {
  fetchUser(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin privileges required",
      });
    }
  });
};

module.exports = { fetchUser, verifyAdmin };
