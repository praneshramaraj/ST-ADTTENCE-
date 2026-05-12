const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNo: { type: String, unique: true, uppercase: true, trim: true, required: true },
    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    parentEmail: String,
    phone: String,
    parentPhone: String,
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    class: { type: String, required: true },
    department: String,
    batch: String,
    isActive: { type: Boolean, default: true },
    absentReason: String,
    leaveLetterUrl: String,
    lastAbsentAlertStreak: { type: Number, default: 0 },
    lowAttendanceWarningSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
