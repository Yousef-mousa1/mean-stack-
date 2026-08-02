const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");


const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // بنحط _id كمان جنب id، عشان كود الـ Cart/Orders
    // اللي بيستخدم req.user._id يشتغل من غير ما نعدل فيه
    req.user = { ...decoded, _id: decoded.id };

    next();

  } catch (error) {
    next(error);
  }
};


module.exports = { protect: auth };