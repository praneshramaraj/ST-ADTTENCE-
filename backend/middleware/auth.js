const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { DEPARTMENT_CLASS_MAP } = require("../utils/constants");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const permit = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

const allowedClassesFor = (user) => {
  if (user.role === "counsellor") return user.classAssigned ? [user.classAssigned] : [];
  if (user.role === "student") return [];
  if (user.role === "hod") return user.department ? DEPARTMENT_CLASS_MAP[user.department] || [] : null;
  return [];
};

const canAccessClass = (user, className) => {
  const allowed = allowedClassesFor(user);
  return allowed === null || allowed.includes(className);
};

module.exports = { auth, permit, allowedClassesFor, canAccessClass };
