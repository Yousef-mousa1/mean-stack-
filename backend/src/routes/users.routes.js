const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/role");

router.use(protect);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.delete("/profile", deleteUserProfile);

router.get("/", restrictTo("admin"), getUsers);
router.put("/:id", restrictTo("admin"), updateUser);
router.delete("/:id", restrictTo("admin"), deleteUser);

module.exports = router;