const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { name: data.name },
    { new: true }
  ).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const deleteProfile = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const getAllUsers = async () => {
  const users = await User.find().select("-password");
  return users;
};

const updateUserById = async (userId, data) => {
  const allowedFields = {};
  if (data.name !== undefined) allowedFields.name = data.name;
  if (data.email !== undefined) allowedFields.email = data.email;
  if (data.role !== undefined) allowedFields.role = data.role;

  const user = await User.findByIdAndUpdate(
    userId,
    allowedFields,
    { new: true }
  ).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const deleteUserById = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  updateUserById,
  deleteUserById,
};