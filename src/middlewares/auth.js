const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");


const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    next(error);
  }
};


module.exports = { protect: auth };