const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ✅ Use Gmail here
    auth: {
      user: "pandaabhishek34@gmail.com", // ✅ Your Gmail address
      pass: process.env.EMAIL_PASS, // ✅ Your App Password from .env
    },
  });

  const mailOptions = {
    from: "pandaabhishek34@gmail.com",
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

module.exports = sendEmail;
