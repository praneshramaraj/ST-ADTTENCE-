const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const EmailSettings = require("../models/EmailSettings");
const { CLASS_PREFIX } = require("./constants");

const hods = [
  ["HOD Admin", "hod@college.edu", null],
  ["IT HOD", "it.hod@college.edu", "IT"],
  ["ECE HOD", "ece.hod@college.edu", "ECE"],
  ["CSE HOD", "cse.hod@college.edu", "CSE"],
  ["AIDS HOD", "aids.hod@college.edu", "AIDS"],
  ["AIML HOD", "aiml.hod@college.edu", "AIML"],
  ["MECH HOD", "mech.hod@college.edu", "MECH"]
];

const counsellorClasses = ["IT-A", "IT-B", "IT-C", "IT-D", "ECE-A", "ECE-B", "CSE-A", "CSE-B", "AIDS-A", "AIDS-B", "AIDS-C", "AIML-A", "MECH-A"];

async function upsertUser(payload, password) {
  const exists = await User.findOne({ email: payload.email });
  if (exists) return exists;
  return User.create({ ...payload, password: await bcrypt.hash(password, 10) });
}

async function seedStudents() {
  for (const classAssigned of counsellorClasses) {
    const prefix = CLASS_PREFIX[classAssigned];
    const department = classAssigned.split("-")[0];
    for (let i = 1; i <= 60; i++) {
      const rollNo = `24${prefix}${String(i).padStart(3, "0")}`;
      const student = await Student.findOneAndUpdate(
        { rollNo },
        {
          $setOnInsert: {
            rollNo,
            name: `${classAssigned} Student ${i}`,
            email: `${rollNo.toLowerCase()}@student.sjit`,
            parentEmail: `parent.${rollNo.toLowerCase()}@example.com`,
            phone: `90000${String(i).padStart(5, "0")}`,
            parentPhone: `94444${String(i).padStart(5, "0")}`,
            gender: i % 2 ? "Male" : "Female",
            class: classAssigned,
            department,
            batch: "2024-2028"
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await upsertUser(
        {
          name: student.name,
          email: student.email,
          role: "student",
          classAssigned,
          rollNo,
          studentRef: student._id,
          department
        },
        "student@123"
      );
    }
  }
}

async function seed() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log("Database already seeded. Skipping seed.");
    return;
  }
  for (const [name, email, department] of hods) {
    await upsertUser({ name, email, role: "hod", department, classAssigned: null }, "hod@sjit");
  }
  for (const classAssigned of counsellorClasses) {
    const [dept, section] = classAssigned.toLowerCase().split("-");
    await upsertUser(
      { name: `${classAssigned} Counsellor`, email: `${dept}-${section}@college.edu`, role: "counsellor", classAssigned, department: classAssigned.split("-")[0] },
      "sjit@321"
    );
  }
  await seedStudents();
  await EmailSettings.findOneAndUpdate({ singleton: "settings" }, { singleton: "settings" }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log("Seeded ST Attendance Manager users");
}

module.exports = seed;
