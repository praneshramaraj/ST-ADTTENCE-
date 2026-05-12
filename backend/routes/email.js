const express = require("express");
const EmailSettings = require("../models/EmailSettings");
const { auth, permit } = require("../middleware/auth");
const { sendMail } = require("../utils/mailer");

const router = express.Router();
const getSettings = () => EmailSettings.findOneAndUpdate({ singleton: "settings" }, { singleton: "settings" }, { upsert: true, new: true, setDefaultsOnInsert: true });

router.get("/settings", auth, permit("hod"), async (_req, res) => res.json(await getSettings()));
router.put("/settings", auth, permit("hod"), async (req, res) => {
  const settings = await getSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});
router.post("/test", auth, permit("hod"), async (req, res) => res.json(await sendMail(req.body.to || req.user.email, "ST Attendance Manager Test", "Email Test", "Email alerts are configured.")));

module.exports = router;
