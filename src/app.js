const express = require("express");

const productsRoutes = require("./routes/products.routes");
const categoriesRoutes = require("./routes/categories.routes");
const { generalLimiter } = require("./middlewares/rateLimiter");

const app = express();

app.use(express.json());
app.use(generalLimiter); // يطبق على كل الـ routes تحته

app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);

module.exports = app;