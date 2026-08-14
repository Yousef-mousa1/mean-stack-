const {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  updateUserById,
  deleteUserById,
} = require("../services/users.service");

const getUserProfile = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserProfile = async (req, res, next) => {
  try {
    await deleteProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserById(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await deleteUserById(req.params.id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUsers,
  updateUser,
  deleteUser,
};