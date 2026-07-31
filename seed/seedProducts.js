require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Product = require("../src/models/Product");

const CSV_PATH = path.join(__dirname, "grocery_data_dec_2025.csv");

// productImage column comes as a python-style string like:
// [{'imageUrl': '...', 'largeUrl': '...'}]
// so we convert it to valid JSON before parsing.
function extractImage(rawImageField) {
  if (!rawImageField || rawImageField === "[]") return "";
  try {
    const jsonSafe = rawImageField
      .replace(/'/g, '"')
      .replace(/None/g, "null")
      .replace(/True/g, "true")
      .replace(/False/g, "false");
    const parsed = JSON.parse(jsonSafe);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0].largeUrl || parsed[0].imageUrl || "";
    }
    return "";
  } catch (err) {
    return "";
  }
}

function cleanDescription(desc) {
  if (!desc) return "";
  return desc.replace(/<[^>]*>/g, "").trim();
}

function toNumber(value) {
  if (!value) return undefined;
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");

    const rows = [];

    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => {
        if (!row.productId || !row.title) return; // skip broken rows

        rows.push({
          updateOne: {
            filter: { productId: row.productId },
            update: {
              $set: {
                productId: row.productId,
                name: row.title,
                description: cleanDescription(row.description),
                brand: row.brand || "",
                image: extractImage(row.productImage),
                price: toNumber(row["pricing.price"]),
                oldPrice: toNumber(row["pricing.wasPrice"]),
                unit: row["pricingUnits.unit"] || "",
                packageSize: row.packageSizing || "",
                productLink: row.link || "",
              },
            },
            upsert: true,
          },
        });
      })
      .on("end", async () => {
        console.log(`Parsed ${rows.length} valid rows from CSV`);

        if (rows.length === 0) {
          console.log("No rows to insert. Exiting.");
          process.exit(0);
        }

        // bulkWrite in batches to avoid overloading Atlas
        const BATCH_SIZE = 500;
        let inserted = 0;

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE);
          const result = await Product.bulkWrite(batch);
          inserted += result.upsertedCount + result.modifiedCount;
          console.log(`Batch ${i / BATCH_SIZE + 1}: processed ${batch.length} rows`);
        }

        console.log(`Done. Upserted/updated approx ${inserted} products.`);
        process.exit(0);
      });
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();