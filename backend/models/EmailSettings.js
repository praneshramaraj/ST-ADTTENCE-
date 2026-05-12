const mongoose = require("mongoose");

const emailSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "settings", unique: true },
    leaveSubmitted: { type: Boolean, default: true },
    leaveApprovedCounsellor: { type: Boolean, default: true },
    leaveApprovedHOD: { type: Boolean, default: true },
    leaveRejected: { type: Boolean, default: true },
    odApproved: { type: Boolean, default: true },
    absentAlert: { type: Boolean, default: true },
    lowAttendanceWarning: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailSettings", emailSettingsSchema);
