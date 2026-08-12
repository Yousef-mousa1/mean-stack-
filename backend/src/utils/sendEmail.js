const nodemailer = require("nodemailer");

// الترانسبورتر بيتعمل مرة واحدة بس ويتعاد استخدامه في كل الإيميلات
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Mousa Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`✓ Email sent to ${to}`);
    return true;
  } catch (error) {
    // بنطبع الخطأ بوضوح عشان لو حصلت مشكلة (زي App Password غلط) تبان فورًا
    console.error("✗ Failed to send email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;