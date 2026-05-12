const nodemailer = require("nodemailer");

const enabled = () => process.env.EMAIL_ENABLED === "true" && process.env.EMAIL_USER && process.env.EMAIL_PASS;

const html = (title, body) => `
  <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:24px">
    <div style="max-width:640px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:linear-gradient(135deg,#1a56db,#1e429f,#111827);color:#fff;padding:24px">
        <h2 style="margin:0">ST Attendance Manager</h2>
        <p style="margin:6px 0 0">We Make You Shine</p>
      </div>
      <div style="padding:24px;color:#111827"><h3>${title}</h3><p>${body}</p></div>
    </div>
  </div>`;

async function sendMail(to, subject, title, body) {
  if (!enabled() || !to) return { skipped: true };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || "ST Attendance Manager",
    to,
    subject,
    html: html(title, body)
  });
}

module.exports = { sendMail };
