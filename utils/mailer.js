const nodemailer = require("nodemailer");

//console.log("Email:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, text, name = "User", role = "user") => {
  const mailOptions = {
    from: `"Team CRM Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text, // fallback for non-HTML email clients
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background: #f9f9f9;">
        <h2 style="color: #4A90E2;">👋 Welcome to CRM Portal, ${name}!</h2>
        <p style="font-size: 16px; color: #333;">
          We're excited to have you on board as a <strong>${role}</strong>. Here's to a great journey together! 🚀
        </p>
        <p style="font-size: 14px; color: #666;">
          If you have any questions or need help, just reply to this email.
        </p>
        <hr style="margin-top: 30px;">
        <footer style="font-size: 12px; color: #999;">
          Sent with ❤️ from the CRM Portal Team
        </footer>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to", to);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};

module.exports = sendMail;


