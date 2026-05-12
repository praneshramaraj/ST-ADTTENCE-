const express = require("express");
const multer = require("multer");
const path = require("path");
const Achievement = require("../models/Achievement");
const Student = require("../models/Student");
const { auth, permit, allowedClassesFor, canAccessClass } = require("../middleware/auth");

const router = express.Router();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });
const fields = upload.fields([{ name: "certificate", maxCount: 1 }, { name: "winningPhotos", maxCount: 8 }, ...Array.from({ length: 10 }, (_, i) => ({ name: `teamCertificate_${i}`, maxCount: 1 }))]);
const url = (f) => (f ? `/uploads/${f.filename}` : "");

  router.get("/", auth, async (req, res) => {
    const query = {};
    if (req.user.role === "student") query.studentUser = req.user._id;
    else {
      const allowed = allowedClassesFor(req.user);
      if (allowed !== null) query.class = { $in: allowed };
      if (req.query.class) query.class = req.query.class;
    }
  res.json(await Achievement.find(query).populate("student").populate("verifiedBy", "name").sort({ createdAt: -1 }));
});

router.post("/", auth, permit("student"), fields, async (req, res) => {
  const student = await Student.findById(req.user.studentRef);
  const teamMembers = req.body.teamMembers ? JSON.parse(req.body.teamMembers) : [];
  teamMembers.forEach((m, i) => {
    const f = req.files?.[`teamCertificate_${i}`]?.[0];
    if (f) {
      m.certificateUrl = url(f);
      m.originalFileName = f.originalname;
    }
  });
  const doc = await Achievement.create({
    ...req.body,
    isTeamEvent: req.body.isTeamEvent === "true",
    student: student._id,
    studentUser: req.user._id,
    department: student.department,
    class: student.class,
    teamMembers,
    certificateUrl: url(req.files?.certificate?.[0]),
    originalFileName: req.files?.certificate?.[0]?.originalname,
    winningPhotoUrls: (req.files?.winningPhotos || []).map(url)
  });
  res.status(201).json(doc);
});

router.put("/:id/review", auth, permit("hod"), async (req, res) => {
  const doc = await Achievement.findById(req.params.id);
  if (!doc || !canAccessClass(req.user, doc.class)) return res.status(404).json({ message: "Achievement not found" });
  doc.status = req.body.status;
  doc.hodRemark = req.body.hodRemark || req.body.remark;
  doc.verifiedBy = req.user._id;
  doc.verifiedAt = new Date();
  await doc.save();
  res.json(doc);
});

module.exports = router;
