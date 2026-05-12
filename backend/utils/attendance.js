const Attendance = require("../models/Attendance");

function pct(attended, total) {
  return total ? Math.round((attended / total) * 100) : 0;
}

async function studentAttendanceSummary(studentId) {
  const entries = await Attendance.find({ "records.student": studentId }).sort({ date: -1, period: 1 });
  let total = 0;
  let present = 0;
  let absent = 0;
  let od = 0;
  let late = 0;
  const rows = [];
  for (const entry of entries) {
    const record = entry.records.find((r) => String(r.student) === String(studentId));
    if (!record) continue;
    total += 1;
    if (["Present", "OD", "Late"].includes(record.status)) present += 1;
    if (record.status === "Absent") absent += 1;
    if (record.status === "OD") od += 1;
    if (record.status === "Late") late += 1;
    rows.push({ date: entry.date, period: entry.period, subject: entry.subject, status: record.status, remarks: record.remarks });
  }
  return { total, present, absent, od, late, percentage: pct(present, total), rows };
}

module.exports = { pct, studentAttendanceSummary };
