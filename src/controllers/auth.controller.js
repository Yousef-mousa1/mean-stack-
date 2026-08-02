const authService = require("../services/auth.service");


const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Register successful, check your email for OTP",
      user,
    });

  } catch (error) {
    next(error);
  }
};


const verifyOTP = async (req, res, next) => {
  try {

    const { userId, otp } = req.body;

    await authService.verifyOTP(
      userId,
      otp
    );

    res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    const result = await authService.login(
      email,
      password
    );

    res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};


const forgetPassword = async (req, res, next) => {
  try {

    await authService.forgetPassword(
      req.body.email
    );

    res.json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    next(error);
  }
};


const resetPassword = async (req, res, next) => {
  try {

    const {
      userId,
      otp,
      newPassword
    } = req.body;


    await authService.resetPassword(
      userId,
      otp,
      newPassword
    );


    res.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  register,
  verifyOTP,
  login,
  forgetPassword,
  resetPassword,
};
