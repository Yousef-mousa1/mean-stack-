const rateLimit = require("express-rate-limit");

//  مناسب لمستخدم بيتصفح المنتجات والكاتيجوريز عادي
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 1000,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//  حماية من محاولات تخمين الباسورد (brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // متحسبش المحاولات الناجحة، بس الفاشلة
});

module.exports = { generalLimiter, authLimiter };
