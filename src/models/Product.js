const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    brand: String,

    image: String,

    price: Number,

    oldPrice: Number,

    unit: String,

    packageSize: String,

    productLink: String,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    stock: {
      type: Number,
      default: 100,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);