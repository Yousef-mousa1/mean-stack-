const Product = require("../models/Product");
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

    if (category) {
      filter.category = category; // categoryId
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
      return next(new ApiError("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};