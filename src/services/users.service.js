const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};


const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      name: data.name,
    },
    {
      new: true,
    }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};


const deleteProfile = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};


module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};