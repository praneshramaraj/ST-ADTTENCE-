const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    class: { type: String, required: true },
    period: { type: Number, required: true },
    subject: String,
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        status: { type: String, enum: ["Present", "Absent", "OD", "Late"], default: "Present" },
        remarks: String
      }
    ],
    isLocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1, class: 1, period: 1 }, { unique: true });
module.exports = mongoose.model("Attendance", attendanceSchema);
