const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
} = require("../controllers/categories.controller");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/:id/products", getCategoryProducts);

module.exports = router;