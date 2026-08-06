const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category"); // ⚠️ عدّل المسار ده لو موديل الفئة عندك في مكان مختلف
const ApiError = require("../utils/ApiError");

// GET /api/products
// query params: page, limit, search, brand, category, minPrice, maxPrice, sort
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    // بيقبل category سواء جاي كـ ObjectId أو كاسم نصي (زي "Bakery" أو "Dairy&Egges")
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const categoryDoc = await Category.findOne({
          name: { $regex: `^${category}$`, $options: "i" },
        });
        // لو مفيش فئة بالاسم ده، رجّع نتيجة فاضية بدل ما تكسر أو تعرض كل المنتجات غلط
        filter.category = categoryDoc ? categoryDoc._id : null;
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // default: only show available products
    filter.isAvailable = true;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // cap at 100
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
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

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products  (Admin only)
const createProduct = async (req, res, next) => {
  try {
    const {
      productId,
      name,
      description,
      brand,
      image,
      price,
      oldPrice,
      unit,
      packageSize,
      productLink,
      category,
      stock,
      isAvailable,
    } = req.body;

    if (!name || price === undefined) {
      return next(new ApiError(400, "name and price are required"));
    }

    const product = await Product.create({
      productId,
      name,
      description,
      brand,
      image,
      price,
      oldPrice,
      unit,
      packageSize,
      productLink,
      category,
      stock,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id  (Admin only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // رجّع النسخة بعد التحديث مش قبله
      runValidators: true, // طبّق قواعد الـ schema (زي required) على التحديث كمان
    });

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id  (Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};