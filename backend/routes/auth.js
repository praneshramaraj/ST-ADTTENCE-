const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const { auth, permit } = require("../middleware/auth");

const router = express.Router();
const normalizeRoll = (v = "") => v.split("@")[0].toUpperCase().trim();
const tokenFor = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, classAssigned: u.classAssigned, rollNo: u.rollNo, studentRef: u.studentRef, department: u.department });

router.post("/login", async (req, res) => {
  const login = (req.body.login || req.body.email || "").trim();
  const password = req.body.password || "";
  const rollNo = normalizeRoll(login);
  const user = await User.findOne({ $or: [{ email: login.toLowerCase() }, { rollNo }] });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ token: tokenFor(user), user: publicUser(user) });
});

router.post("/register-student", async (req, res) => {
  const rollNo = normalizeRoll(req.body.rollNo);
  const classAssigned = req.body.classAssigned || req.body.class;
  const password = req.body.password || "";
  const student = await Student.findOne({ rollNo, class: classAssigned });
  if (!student) return res.status(404).json({ message: "Student roll number and class not found" });
  const email = student.email || `${rollNo.toLowerCase()}@student.sjit`;
  let user = await User.findOne({ $or: [{ rollNo }, { studentRef: student._id }] });
  if (user) return res.status(409).json({ message: "Login already exists" });
  user = await User.create({
    name: student.name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "student",
    classAssigned,
    rollNo,
    studentRef: student._id,
    department: student.department
  });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
});

router.post("/create-student-login", auth, permit("hod", "counsellor"), async (req, res) => {
  const student = await Student.findById(req.body.studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });
  const password = req.body.password || "student@123";
  const email = student.email || `${student.rollNo.toLowerCase()}@student.sjit`;
  const user = await User.findOneAndUpdate(
    { rollNo: student.rollNo },
    { name: student.name, email, password: await bcrypt.hash(password, 10), role: "student", classAssigned: student.class, rollNo: student.rollNo, studentRef: student._id, department: student.department },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ user: publicUser(user), password });
});

router.post("/bulk-student-login", auth, permit("hod", "counsellor"), async (req, res) => {
  const filter = req.user.role === "counsellor" ? { class: req.user.classAssigned } : req.body.class ? { class: req.body.class } : {};
  const students = await Student.find(filter);
  let created = 0;
  for (const student of students) {
    const exists = await User.findOne({ rollNo: student.rollNo });
    if (exists) continue;
    created += 1;
    await User.create({ name: student.name, email: student.email || `${student.rollNo.toLowerCase()}@student.sjit`, password: await bcrypt.hash("student@123", 10), role: "student", classAssigned: student.class, rollNo: student.rollNo, studentRef: student._id, department: student.department });
  }
  res.json({ created });
});

router.post("/fix-student-users", auth, permit("hod"), async (_req, res) => {
  const users = await User.find({ role: "student" });
  let fixed = 0;
  for (const user of users) {
    const student = await Student.findOne({ rollNo: user.rollNo });
    if (student) {
      user.studentRef = student._id;
      user.classAssigned = student.class;
      user.department = student.department;
      await user.save();
      fixed += 1;
    }
  }
  res.json({ fixed });
});

router.post("/reset-all-passwords", auth, permit("hod"), async (req, res) => {
  const password = await bcrypt.hash(req.body.password || "student@123", 10);
  const result = await User.updateMany({ role: req.body.role || "student" }, { password });
  res.json({ modified: result.modifiedCount });
});

module.exports = router;
