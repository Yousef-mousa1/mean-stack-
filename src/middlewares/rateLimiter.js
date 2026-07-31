const rateLimit = require("express-rate-limit");

// حد عام لكل المشروع: 100 طلب كل 15 دقيقة لكل IP
// مناسب لمستخدم بيتصفح المنتجات والكاتيجوريز عادي
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true, // يرجع معلومات الحد في response headers (RateLimit-*)
  legacyHeaders: false, // يوقف الـ headers القديمة (X-RateLimit-*)
});

// حد أشد جداً لصفحات الـ Auth الحساسة: 5 محاولات كل 15 دقيقة لكل IP
// حماية من محاولات تخمين الباسورد (brute force)
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
