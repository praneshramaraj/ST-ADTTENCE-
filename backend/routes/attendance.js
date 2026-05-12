const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const EmailSettings = require("../models/EmailSettings");
const { auth, permit, allowedClassesFor, canAccessClass } = require("../middleware/auth");
const { studentAttendanceSummary, pct } = require("../utils/attendance");
const { sendMail } = require("../utils/mailer");

const router = express.Router();
const today = () => new Date().toISOString().slice(0, 10);
const classFilter = (user) => {
  const allowed = allowedClassesFor(user);
  return allowed === null ? {} : { class: { $in: allowed } };
};

async function classSummary(cls, date) {
  const students = await Student.find({ class: cls, isActive: true });
  const entries = await Attendance.find({ class: cls, ...(date ? { date } : {}) });
  let total = 0, attended = 0, absent = 0, od = 0, late = 0, presentToday = 0;
  for (const entry of entries) {
    for (const record of entry.records) {
      total += 1;
      if (["Present", "OD", "Late"].includes(record.status)) attended += 1;
      if (record.status === "Absent") absent += 1;
      if (record.status === "OD") od += 1;
      if (record.status === "Late") late += 1;
      if (record.status === "Present") presentToday += 1;
    }
  }
  return { class: cls, students: students.length, total, present: presentToday, attended, absent, od, late, percentage: pct(attended, total) };
}

router.get("/date/:date", auth, async (req, res) => {
  const query = { date: req.params.date, ...classFilter(req.user) };
  if (req.query.class) query.class = req.query.class;
  res.json(await Attendance.find(query).populate("records.student").populate("markedBy", "name"));
});

router.post("/mark", auth, permit("hod", "counsellor"), async (req, res) => {
  const { date, class: cls, period, subject, records } = req.body;
  if (!canAccessClass(req.user, cls)) return res.status(403).json({ message: "Forbidden" });
  const existing = await Attendance.findOne({ date, class: cls, period });
  if (existing?.isLocked) return res.status(423).json({ message: "Attendance is locked" });
  const attendance = await Attendance.findOneAndUpdate(
    { date, class: cls, period },
    { date, class: cls, period, subject, records, markedBy: req.user._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const settings = await EmailSettings.findOne({ singleton: "settings" });
  for (const r of records || []) {
    const summary = await studentAttendanceSummary(r.student);
    const student = await Student.findById(r.student);
    if (!student) continue;
    if (summary.percentage < 75 && settings?.lowAttendanceWarning && !student.lowAttendanceWarningSent) {
      await sendMail(student.email, "Low Attendance Warning", "Low Attendance Warning", `Your attendance is ${summary.percentage}%, below the required 75%.`);
      student.lowAttendanceWarningSent = true;
    }
    if (r.status === "Absent") {
      const dates = [...new Set((await Attendance.find({ "records.student": student._id }).sort({ date: -1 })).map((a) => a.date))].slice(0, 3);
      let fullAbsentDays = 0;
      for (const d of dates) {
        const dayEntries = await Attendance.find({ date: d, "records.student": student._id });
        if (dayEntries.length && dayEntries.every((a) => a.records.find((x) => String(x.student) === String(student._id))?.status === "Absent")) fullAbsentDays += 1;
      }
      student.lastAbsentAlertStreak = fullAbsentDays;
      if (fullAbsentDays >= 3 && settings?.absentAlert) await sendMail(student.parentEmail, "Absent Alert", "Parent Absent Alert", `${student.name} has been absent for 3 consecutive full attendance days.`);
    }
    await student.save();
  }
  res.json(attendance);
});

router.get("/student/:id", auth, async (req, res) => {
  if (req.user.role === "student" && String(req.user.studentRef) !== String(req.params.id)) return res.status(403).json({ message: "Forbidden" });
  res.json(await studentAttendanceSummary(req.params.id));
});

router.get("/report", auth, async (req, res) => {
  const query = classFilter(req.user);
  if (req.query.class) query.class = req.query.class;
  const students = await Student.find(query).sort({ class: 1, rollNo: 1 });
  const rows = [];
  for (const student of students) rows.push({ student, ...(await studentAttendanceSummary(student._id)) });
  res.json(rows);
});

router.get("/logs", auth, async (req, res) => {
  const query = classFilter(req.user);
  if (req.query.class) query.class = req.query.class;
  res.json(await Attendance.find(query).sort({ date: -1, period: -1 }).limit(200).populate("markedBy", "name"));
});

router.get("/class-summary", auth, async (req, res) => {
  const cls = req.query.class || req.user.classAssigned;
  if (!canAccessClass(req.user, cls)) return res.status(403).json({ message: "Forbidden" });
  res.json(await classSummary(cls, req.query.date));
});

router.get("/all-classes-summary", auth, async (req, res) => {
  const classes = allowedClassesFor(req.user) || (await Student.distinct("class"));
  res.json(await Promise.all(classes.map((cls) => classSummary(cls, req.query.date))));
});

router.get("/cross-comparison", auth, async (req, res) => {
  const classes = allowedClassesFor(req.user) || (await Student.distinct("class"));
  res.json(await Promise.all(classes.map((cls) => classSummary(cls))));
});

router.put("/:id/lock", auth, permit("hod"), async (req, res) => {
  res.json(await Attendance.findByIdAndUpdate(req.params.id, { isLocked: req.body.isLocked ?? true }, { new: true }));
});

module.exports = router;
