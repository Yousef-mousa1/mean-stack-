const express = require("express");

const router = express.Router();

const {
  register,
  verifyOTP,
  login,
  forgetPassword,
  resetPassword,
} = require("../controllers/auth.controller");


router.post("/register", register);

router.post("/verify-otp", verifyOTP);

router.post("/login", login);

router.post("/forget-password", forgetPassword);

router.post("/reset-password", resetPassword);


module.exports = router;