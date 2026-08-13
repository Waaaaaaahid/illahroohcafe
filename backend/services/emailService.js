// backend/services/emailService.js
// Nodemailer transport. Enabled when SMTP_HOST/SMTP_USER/SMTP_PASS/EMAIL_FROM
// are configured in the environment; otherwise reports itself as disabled and
// callers respond gracefully.
const nodemailer = require('nodemailer');

let transporter = null;

const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM,
  );

/**
 * Lazily builds a nodemailer transporter from SMTP_* env vars.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  if (!isEmailConfigured()) {
    throw new Error(
      'Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM.',
    );
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

/**
 * Sends a generic email. Throws with a descriptive message when the
 * SMTP service is not configured or the provider rejects the message.
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();
  return mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail, isEmailConfigured };