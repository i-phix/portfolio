const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

const smtpPass = defineSecret("SMTP_PASS");

const FROM_ADDRESS = "iphix09@gmail.com";
const TO_ADDRESS = "hello@chesochieng.com";
const SITE_URL = "https://chesochieng.com";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml({ name, email, website, interest, message }) {
  const rows = [
    ["Name", escapeHtml(name)],
    ["Email", escapeHtml(email)],
    website ? ["Website link", escapeHtml(website)] : null,
    interest ? ["Interested in", escapeHtml(interest)] : null,
  ].filter(Boolean);

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;color:#666;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:8px 12px;color:#111;">${value}</td>
      </tr>`,
    )
    .join("");

  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#111;border-bottom:2px solid #f5e642;padding-bottom:8px;">New Contact Form Submission</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rowsHtml}</table>
      <div style="padding:8px 12px;">
        <div style="color:#666;font-weight:600;margin-bottom:4px;">Message</div>
        <div style="color:#111;white-space:pre-wrap;background:#f7f7f7;border-radius:6px;padding:12px;">${escapeHtml(message)}</div>
      </div>
    </div>`;
}

exports.contact = onRequest({ secrets: [smtpPass] }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // fetch() callers ask for JSON and get a response without leaving the page.
  // Plain <form> submits (no JS) fall back to a redirect.
  const wantsJson = (req.get("Accept") || "").includes("application/json");
  const respond = (success, message) => {
    if (wantsJson) {
      res.status(success ? 200 : 400).json({ success, message });
    } else {
      res.redirect(303, `${SITE_URL}/contact.html?${success ? "sent=1" : "error=1"}`);
    }
  };

  const { name, email, message, interest, website, botcheck } = req.body || {};

  // Honeypot: bots fill hidden fields. Respond as if it succeeded so they don't retry.
  if (botcheck) {
    respond(true, "Success! Your message has been sent.");
    return;
  }

  if (!name || !email || !message) {
    respond(false, "Please fill in your name, email, and message.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: FROM_ADDRESS,
      pass: smtpPass.value(),
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${FROM_ADDRESS}>`,
      to: TO_ADDRESS,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        website ? `Website link: ${website}` : null,
        interest ? `Interested in: ${interest}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: buildEmailHtml({ name, email, website, interest, message }),
    });

    respond(true, "Success! Your message has been sent.");
  } catch (err) {
    console.error("Failed to send contact form email", err);
    respond(false, "Something went wrong. Please try again.");
  }
});
