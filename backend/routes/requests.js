const express = require("express");
const Leave = require("../models/Leave");
const OD = require("../models/OD");
const Student = require("../models/Student");
const { auth, permit, canAccessClass, allowedClassesFor } = require("../middleware/auth");
const { sendMail } = require("../utils/mailer");

function makeRouter(Model, type) {
  const router = express.Router();
  const populate = (q) => q.populate("student").populate("studentUser", "name email rollNo").sort({ createdAt: -1 });
  const scoped = async (req) => {
    if (req.user.role === "student") return { studentUser: req.user._id };
    const allowed = allowedClassesFor(req.user);
    const students = await Student.find(allowed === null ? {} : { class: { $in: allowed } }).select("_id");
    return { student: { $in: students.map((s) => s._id) } };
  };

  router.get("/", auth, async (req, res) => {
    const query = await scoped(req);
    if (req.query.class && req.user.role !== "student") {
      const students = await Student.find({ class: req.query.class }).select("_id");
      query.student = { $in: students.map((s) => s._id) };
    }
    if (req.query.status) query.status = req.query.status;
    res.json(await populate(Model.find(query)));
  });

  router.post("/", auth, permit("student"), async (req, res) => {
    const student = await Student.findById(req.user.studentRef);
    const days = type === "leave" ? Math.max(1, Math.ceil((new Date(req.body.toDate) - new Date(req.body.fromDate)) / 86400000) + 1) : undefined;
    const doc = await Model.create({ ...req.body, days, student: student._id, studentUser: req.user._id });
    await sendMail("", `${type} submitted`, `${type.toUpperCase()} Submitted`, `${student.name} submitted a ${type} request.`);
    res.status(201).json(await populate(Model.findById(doc._id)));
  });

  router.put("/:id/counsellor", auth, permit("counsellor", "hod"), async (req, res) => {
    const doc = await Model.findById(req.params.id).populate("student");
    if (!doc || !canAccessClass(req.user, doc.student.class)) return res.status(404).json({ message: "Request not found" });
    const approved = req.body.status === "Approved";
    doc.counsellorStatus = approved ? "Approved" : "Rejected";
    doc.counsellorRemark = req.body.remark;
    doc.counsellorActionBy = req.user._id;
    doc.counsellorActionAt = new Date();
    doc.status = approved ? "CounsellorApproved" : "Rejected";
    await doc.save();
    res.json(doc);
  });

  router.put("/:id/hod", auth, permit("hod"), async (req, res) => {
    const doc = await Model.findById(req.params.id).populate("student");
    if (!doc || !canAccessClass(req.user, doc.student.class)) return res.status(404).json({ message: "Request not found" });
    const approved = req.body.status === "Approved";
    doc.hodStatus = approved ? "Approved" : "Rejected";
    doc.hodRemark = req.body.remark;
    doc.hodActionBy = req.user._id;
    doc.hodActionAt = new Date();
    doc.status = approved ? "Approved" : "Rejected";
    await doc.save();
    res.json(doc);
  });

  router.delete("/:id", auth, async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Request not found" });
    if (req.user.role === "student" && String(doc.studentUser) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    await doc.deleteOne();
    res.json({ ok: true });
  });
  return router;
}

module.exports = { leaveRouter: makeRouter(Leave, "leave"), odRouter: makeRouter(OD, "od") };
