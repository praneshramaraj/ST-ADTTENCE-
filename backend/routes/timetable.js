const express = require("express");
const Timetable = require("../models/Timetable");
const Student = require("../models/Student");
const { auth, permit, canAccessClass, allowedClassesFor } = require("../middleware/auth");
const { PERIOD_TIMINGS } = require("../utils/constants");

const router = express.Router();
const dayName = (d = new Date()) => d.toLocaleDateString("en-US", { weekday: "long" });
const defaultPeriods = PERIOD_TIMINGS.filter((p) => typeof p.periodNo === "number").map((p) => ({ ...p, subject: "Free Hour", staffName: "", type: "Free" }));

router.get("/", auth, async (req, res) => {
  const query = {};
  if (req.query.class) query.class = req.query.class;
  if (req.query.day) query.day = req.query.day;
  if (req.user.role === "student") {
    const student = await Student.findById(req.user.studentRef);
    query.class = student.class;
  } else {
    const allowed = allowedClassesFor(req.user);
    if (allowed !== null) query.class = { $in: allowed };
  }
  res.json(await Timetable.find(query).sort({ class: 1, day: 1 }));
});

router.get("/today", auth, async (req, res) => {
  const cls = req.query.class || req.user.classAssigned || (await Student.findById(req.user.studentRef))?.class;
  const row = await Timetable.findOne({ class: cls, day: dayName() });
  res.json(row || { class: cls, day: dayName(), periods: defaultPeriods });
});

router.get("/week", auth, async (req, res) => {
  const cls = req.query.class || req.user.classAssigned || (await Student.findById(req.user.studentRef))?.class;
  res.json(await Timetable.find({ class: cls }).sort({ day: 1 }));
});

router.post("/", auth, permit("hod", "counsellor"), async (req, res) => {
  if (!canAccessClass(req.user, req.body.class)) return res.status(403).json({ message: "Forbidden" });
  const row = await Timetable.findOneAndUpdate({ class: req.body.class, day: req.body.day }, { ...req.body, createdBy: req.user._id }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.status(201).json(row);
});

router.put("/:id", auth, permit("hod", "counsellor"), async (req, res) => {
  const row = await Timetable.findById(req.params.id);
  if (!row || !canAccessClass(req.user, row.class)) return res.status(404).json({ message: "Timetable not found" });
  Object.assign(row, req.body);
  await row.save();
  res.json(row);
});

router.delete("/:id", auth, permit("hod", "counsellor"), async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
