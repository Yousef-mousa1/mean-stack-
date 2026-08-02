const {
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../services/users.service");


const getUserProfile = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    next(error);
  }
};


const updateUserProfile = async (req, res, next) => {
  try {
    const user = await updateProfile(
      req.user.id,
      req.body
    );

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


module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};