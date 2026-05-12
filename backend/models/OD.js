const mongoose = require("mongoose");

const odSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    endDate: String,
    event: String,
    purpose: String,
    benefit: String,
    venue: String,
    organizedBy: String,
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

module.exports = mongoose.model("OD", odSchema);
