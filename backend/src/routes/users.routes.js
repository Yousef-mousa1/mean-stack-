const express = require("express");

const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/users.controller");

const { protect } = require("../middlewares/auth");


router.use(protect);


router.get("/profile", getUserProfile);

router.put("/profile", updateUserProfile);

router.delete("/profile", deleteUserProfile);


module.exports = router;