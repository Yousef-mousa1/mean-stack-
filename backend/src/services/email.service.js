const sendEmail = require("../utils/sendEmail");

const sendOTPEmail = async (email, otp) => {
  await sendEmail(
    email,
    "Verify Your Email",
   ` Your OTP code is: ${otp}`
  );
};

const sendResetPasswordEmail = async (email, otp) => {
  await sendEmail(
    email,
    "Reset Password OTP",
    `Your reset password code is: ${otp}`
  );
};

module.exports = {
  sendOTPEmail,
  sendResetPasswordEmail,
};