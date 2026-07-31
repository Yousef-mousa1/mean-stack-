const Category = require("../models/Category");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// GET /api/categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new ApiError("Category not found", 404));
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id/products
const getCategoryProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new ApiError("Category not found", 404));
    }

    const [products, total] = await Promise.all([
      Product.find({ category: category._id, isAvailable: true })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments({ category: category._id, isAvailable: true }),
    ]);

    res.status(200).json({
      success: true,
      category: category.name,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
};