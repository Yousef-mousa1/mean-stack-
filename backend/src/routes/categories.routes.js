const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories.controller");

const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/role");

// عام للجميع
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/:id/products", getCategoryProducts);

// admin بس
router.post("/", protect, restrictTo("admin"), createCategory);
router.put("/:id", protect, restrictTo("admin"), updateCategory);
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

module.exports = router;