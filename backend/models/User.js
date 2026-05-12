const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["hod", "counsellor", "student"], required: true },
    classAssigned: String,
    rollNo: { type: String, uppercase: true, trim: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    department: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
