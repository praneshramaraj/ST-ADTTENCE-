const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fromDate: String,
    toDate: String,
    reason: String,
    additionalDetails: String,
    type: { type: String, enum: ["Medical", "Personal", "Family", "Festival", "Other"], default: "Other" },
    days: Number,
    parentsAware: { type: String, enum: ["Yes", "No"], default: "Yes" },
    counsellorStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    counsellorRemark: String,
    counsellorActionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    counsellorActionAt: Date,
    hodStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    hodRemark: String,
    hodActionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hodActionAt: Date,
    status: { type: String, enum: ["Pending", "CounsellorApproved", "Approved", "Rejected"], default: "Pending" },
    emailSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
