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
      return next(new ApiError(404, "Category not found"));
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
      return next(new ApiError(404, "Category not found"));
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

// POST /api/categories  (Admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image } = req.body;

    if (!name || !slug) {
      return next(new ApiError(400, "name and slug are required"));
    }

    const existing = await Category.findOne({
      $or: [{ name }, { slug }],
    });
    if (existing) {
      return next(
        new ApiError(400, "A category with this name or slug already exists")
      );
    }

    const category = await Category.create({ name, slug, description, image });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id  (Admin only)
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return next(new ApiError(404, "Category not found"));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id  (Admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new ApiError(404, "Category not found"));
    }

    // امنع الحذف لو فيه منتجات لسه مرتبطة بالكاتيجوري دي
    const productsCount = await Product.countDocuments({
      category: category._id,
    });
    if (productsCount > 0) {
      return next(
        new ApiError(
          400,
          `Cannot delete: ${productsCount} product(s) still linked to this category`
        )
      );
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
};