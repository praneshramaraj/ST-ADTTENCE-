const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    class: { type: String, required: true },
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
    periods: [
      {
        periodNo: Number,
        subject: String,
        staffName: String,
        startTime: String,
        endTime: String,
        type: { type: String, enum: ["Theory", "Lab", "Break", "Free"], default: "Theory" }
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, day: 1 }, { unique: true });
module.exports = mongoose.model("Timetable", timetableSchema);
