const ApiError = require("../utils/ApiError");

const validation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return next(
        new ApiError(error.details[0].message, 400)
      );
    }

    next();
  };
};

module.exports = validation;