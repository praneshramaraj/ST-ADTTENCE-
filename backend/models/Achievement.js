const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: String,
    class: String,
    title: String,
    category: { type: String, enum: ["Hackathon", "Sports", "Paper Presentation", "Project", "Culturals", "Other"], default: "Other" },
    organizer: String,
    achievementType: { type: String, enum: ["Winner", "Runner Up", "Participation", "Certification", "Other"], default: "Other" },
    eventDate: String,
    description: String,
    isTeamEvent: { type: Boolean, default: false },
    teamMembers: [{ name: String, rollNo: String, certificateUrl: String, originalFileName: String }],
    certificateUrl: String,
    originalFileName: String,
    winningPhotoUrls: [String],
    status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
    hodRemark: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", achievementSchema);
