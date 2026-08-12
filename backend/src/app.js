const express = require("express");
const cors = require("cors");
const path = require("path");
const usersRoutes = require("./routes/users.routes");
const productsRoutes = require("./routes/products.routes");
const categoriesRoutes = require("./routes/categories.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const ordersRoutes = require("./routes/orders.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const couponsRoutes = require("./routes/coupons.routes");

const { generalLimiter } = require("./middlewares/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(cors()); // ← نقلناه هنا، قبل أي route

// serve الصور الثابتة (اللي عملها seedProducts.js في backend/public/images)
app.use("/images", express.static(path.join(__dirname, "..", "public", "images")));

app.use(generalLimiter);

app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponsRoutes);

app.use(errorHandler);

module.exports = app;