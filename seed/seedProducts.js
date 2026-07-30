require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const Product = require("../src/models/Product");

async function seedProducts() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const products = [];

    const filePath = path.join(__dirname, "grocery_data_dec_2025.csv");

    console.log("📂 File Path:", filePath);
    console.log("📂 File Exists:", fs.existsSync(filePath));

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // اطبع أول منتج بس للتأكد إن الملف بيتقري
        if (products.length === 0) {
          console.log("✅ First Row:", row);
        }

        products.push({
          productId: row.productId,
          name: row.title,
          description: row.description,
          brand: row.brand,
          image: row.productImage,
          price: Number(row["pricing.price"]) || 0,
          oldPrice: Number(row["pricing.wasPrice"]) || 0,
          unit: row.uom,
          packageSize: row.packageSizing,
          productLink: row.link,
          stock: 100,
          isAvailable: true,
        });
      })
      .on("end", async () => {
        try {
          console.log(`📦 Total Products Read: ${products.length}`);

          // امسح المنتجات القديمة
          await Product.deleteMany();

          // أضف المنتجات الجديدة
          await Product.insertMany(products);

          console.log(`✅ ${products.length} Products Inserted Successfully`);

          mongoose.connection.close();
        } catch (err) {
          console.log(" Insert Error:", err);
          mongoose.connection.close();
        }
      })
      .on("error", (err) => {
        console.log(" CSV Error:", err);
      });
  } catch (err) {
    console.log(" Connection Error:", err);
  }
}

seedProducts();