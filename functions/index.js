const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

const smtpPass = defineSecret("SMTP_PASS");

const FROM_ADDRESS = "iphix09@gmail.com";
const TO_ADDRESS = "hello@chesochieng.com";
const SITE_URL = "https://chesochieng.com";

exports.contact = onRequest({ secrets: [smtpPass] }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { name, email, message, interest, website, botcheck } = req.body || {};

  // Honeypot: bots fill hidden fields. Redirect as if it succeeded so they don't retry.
  if (botcheck) {
    res.redirect(303, `${SITE_URL}/contact.html?sent=1`);
    return;
  }

  if (!name || !email || !message) {
    res.redirect(303, `${SITE_URL}/contact.html?error=1`);
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
    });

    res.redirect(303, `${SITE_URL}/contact.html?sent=1`);
  } catch (err) {
    console.error("Failed to send contact form email", err);
    res.redirect(303, `${SITE_URL}/contact.html?error=1`);
  }
});
