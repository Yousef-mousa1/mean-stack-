const bcrypt = require("bcrypt");

const User = require("../models/User");
const OTP = require("../models/OTP");

const ApiError = require("../utils/ApiError");
const { createToken } = require("./token.service");
const { sendOTPEmail } = require("./email.service");


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (data) => {

  const existingUser = await User.findOne({
    email: data.email
  });

  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }


  const hashedPassword = await bcrypt.hash(
    data.password,
    10
  );


  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });


  const otp = generateOTP();


  await OTP.create({
    userId: user._id,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });


  await sendOTPEmail(
    user.email,
    otp
  );


  // منشيلش الباسورد المشفر من الرد اللي راجع للـ frontend
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};


const login = async (email, password) => {

  const user = await User.findOne({
    email
  });


  if (!user) {
    throw new ApiError(404, "User not found");
  }


  const isMatch = await bcrypt.compare(
    password,
    user.password
  );


  if (!isMatch) {
    throw new ApiError(400, "Invalid password");
  }


  const token = createToken(user);


  // منشيلش الباسورد المشفر من الرد اللي راجع للـ frontend
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token
  };
};

const verifyOTP = async (userId, otp) => {
  const otpRecord = await OTP.findOne({
    userId,
    otp,
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpRecord.expiresAt < Date.now()) {
    throw new ApiError(400, "OTP expired");
  }

  await User.findByIdAndUpdate(userId, {
    isVerified: true,
  });

  await OTP.deleteMany({
    userId,
  });

  return true;
};


const forgetPassword = async (email) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = generateOTP();

  await OTP.create({
    userId: user._id,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  await sendOTPEmail(
    user.email,
    otp
  );

  return true;
};


const resetPassword = async (userId, otp, newPassword) => {

  const otpRecord = await OTP.findOne({
    userId,
    otp,
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpRecord.expiresAt < Date.now()) {
    throw new ApiError(400, "OTP expired");
  }


  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );


  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });


  await OTP.deleteMany({
    userId,
  });


  return true;
};

module.exports = {
  register,
  login,
  verifyOTP,
  forgetPassword,
  resetPassword,
};