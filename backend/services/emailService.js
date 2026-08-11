// backend/services/emailService.js
// Nodemailer transport structure. NOT connected to a real SMTP server.
const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Lazily builds a nodemailer transporter from SMTP_* env vars.
 * TODO: Populate SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM in backend/.env
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Sends a generic email.
 * TODO: Call this from authController (password reset) and orderController (order confirmation).
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();
  // TODO: wrap in try/catch at call-site and log/handle failures gracefully.
  return mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
