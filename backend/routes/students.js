const express = require("express");
const Student = require("../models/Student");
const User = require("../models/User");
const { auth, permit, allowedClassesFor, canAccessClass } = require("../middleware/auth");
const { CLASS_PREFIX } = require("../utils/constants");

const router = express.Router();
const deptOf = (cls = "") => cls.split("-")[0];

function scopedQuery(user, base = {}) {
  const allowed = allowedClassesFor(user);
  if (allowed === null) return base;
  return { ...base, class: { $in: allowed } };
}

router.get("/", auth, async (req, res) => {
  if (req.user.role === "student") return res.json([await Student.findById(req.user.studentRef)]);
  const q = scopedQuery(req.user);
  if (req.query.class) q.class = req.query.class;
  if (req.query.search) q.$or = [{ name: new RegExp(req.query.search, "i") }, { rollNo: new RegExp(req.query.search, "i") }];
  res.json(await Student.find(q).sort({ class: 1, rollNo: 1 }));
});

router.get("/:id", auth, async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  if (req.user.role !== "student" && !canAccessClass(req.user, student.class)) return res.status(403).json({ message: "Forbidden" });
  if (req.user.role === "student" && String(req.user.studentRef) !== String(student._id)) return res.status(403).json({ message: "Forbidden" });
  res.json(student);
});

router.post("/", auth, permit("hod", "counsellor"), async (req, res) => {
  if (!canAccessClass(req.user, req.body.class)) return res.status(403).json({ message: "Forbidden" });
  const student = await Student.create({ ...req.body, department: req.body.department || deptOf(req.body.class), rollNo: String(req.body.rollNo).toUpperCase() });
  res.status(201).json(student);
});

router.post("/bulk", auth, permit("hod", "counsellor"), async (req, res) => {
  const cls = req.body.class || req.user.classAssigned;
  if (!canAccessClass(req.user, cls)) return res.status(403).json({ message: "Forbidden" });
  const prefix = CLASS_PREFIX[cls];
  const docs = [];
  for (let i = 1; i <= 60; i++) {
    const rollNo = `24${prefix}${String(i).padStart(3, "0")}`;
    docs.push({ rollNo, name: `${cls} Student ${i}`, email: `${rollNo.toLowerCase()}@student.sjit`, parentEmail: `parent.${rollNo.toLowerCase()}@example.com`, phone: "", parentPhone: "", gender: i % 2 ? "Male" : "Female", class: cls, department: deptOf(cls), batch: "2024-2028" });
  }
  const result = await Student.bulkWrite(docs.map((doc) => ({ updateOne: { filter: { rollNo: doc.rollNo }, update: { $setOnInsert: doc }, upsert: true } })));
  res.json({ inserted: result.upsertedCount, class: cls });
});

router.post("/migrate-class", auth, permit("hod"), async (req, res) => {
  const result = await Student.updateMany({ class: req.body.fromClass }, { class: req.body.toClass, department: deptOf(req.body.toClass) });
  await User.updateMany({ classAssigned: req.body.fromClass, role: "student" }, { classAssigned: req.body.toClass, department: deptOf(req.body.toClass) });
  res.json({ modified: result.modifiedCount });
});

router.put("/:id", auth, permit("hod", "counsellor"), async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student || !canAccessClass(req.user, student.class)) return res.status(404).json({ message: "Student not found" });
  Object.assign(student, req.body, { department: req.body.department || deptOf(req.body.class || student.class) });
  await student.save();
  res.json(student);
});

router.put("/:id/absent-reason", auth, async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { absentReason: req.body.absentReason, leaveLetterUrl: req.body.leaveLetterUrl }, { new: true });
  res.json(student);
});

router.delete("/:id", auth, permit("hod", "counsellor"), async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student || !canAccessClass(req.user, student.class)) return res.status(404).json({ message: "Student not found" });
  await User.deleteMany({ rollNo: student.rollNo });
  await student.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
