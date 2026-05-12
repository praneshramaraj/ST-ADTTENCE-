const express = require("express");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const OD = require("../models/OD");
const { auth, allowedClassesFor } = require("../middleware/auth");
const { studentAttendanceSummary } = require("../utils/attendance");

const router = express.Router();
const today = () => new Date().toISOString().slice(0, 10);

router.get("/stats", auth, async (req, res) => {
  if (req.user.role === "student") {
    const summary = await studentAttendanceSummary(req.user.studentRef);
    return res.json(summary);
  }
  const allowed = allowedClassesFor(req.user);
  const classQuery = allowed === null ? {} : { class: { $in: allowed } };
  const students = await Student.find(classQuery);
  const entries = await Attendance.find({ date: today(), ...classQuery });
  const counts = { Present: 0, Absent: 0, OD: 0, Late: 0 };
  entries.forEach((e) => e.records.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; }));
  const lowRows = [];
  for (const student of students) {
    const s = await studentAttendanceSummary(student._id);
    if (s.total && s.percentage < 75) lowRows.push({ student, percentage: s.percentage });
  }
  res.json({
    totalStudents: students.length,
    totalClasses: allowed === null ? (await Student.distinct("class")).length : allowed.length,
    presentToday: counts.Present,
    absentToday: counts.Absent,
    onDuty: counts.OD,
    late: counts.Late,
    lowAttendance: lowRows.length,
    lowRows,
    pendingLeavesHod: await Leave.countDocuments({ status: "CounsellorApproved", ...{} }),
    pendingOdsHod: await OD.countDocuments({ status: "CounsellorApproved" })
  });
});

module.exports = router;
