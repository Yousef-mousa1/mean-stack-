const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");

const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/role");

// عام للجميع (مفيش داعي تسجل دخول عشان تتصفح المنتجات)
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// admin بس (لازم تسجل دخول + دور admin)
router.post("/", protect, restrictTo("admin"), createProduct);
router.put("/:id", protect, restrictTo("admin"), updateProduct);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);

module.exports = router;