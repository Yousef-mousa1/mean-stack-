const generateToken = require("../utils/generateToken");

const createToken = (user) => {
  return generateToken({
    id: user._id,
    role: user.role,
  });
};

module.exports = {
  createToken,
};