const express = require("express");

const router = express.Router();

// GET All Products
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Get All Products",
  });
});

// GET Product By ID
router.get("/:id", (req, res) => {
  res.status(200).json({
    message: "Get Product By ID",
    id: req.params.id,
  });
});

// Create Product
router.post("/", (req, res) => {
  res.status(201).json({
    message: "Product Created",
    data: req.body,
  });
});

// Update Product
router.put("/:id", (req, res) => {
  res.status(200).json({
    message: "Product Updated",
    id: req.params.id,
    data: req.body,
  });
});

// Delete Product
router.delete("/:id", (req, res) => {
  res.status(200).json({
    message: "Product Deleted",
    id: req.params.id,
  });
});

module.exports = router;