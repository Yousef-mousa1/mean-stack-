const ApiError = require("../utils/ApiError");

// (Role-Based Access Control)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this resource", 403)
      );
    }

    next();
  };
};

module.exports = { restrictTo };