require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

// كل كاتيجوري وكلمات مفتاحية بندور عليها في اسم المنتج (case-insensitive)
// الترتيب مهم: أول match بيكسب، فحطينا الأكتر تحديداً فوق
const CATEGORY_RULES = [
  {
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    keywords: [
      "milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "egg",
      "cheddar", "margarine",
    ],
  },
  {
    name: "Bakery",
    slug: "bakery",
    keywords: [
      "bread", "bun", "bagel", "croissant", "muffin", "cake", "pastry",
      "tortilla", "baguette", "sourdough", "loaf", "miche", "bistro",
    ],
  },
  {
    name: "Meat & Seafood",
    slug: "meat-seafood",
    keywords: [
      "chicken", "beef", "pork", "turkey", "bacon", "sausage", "fish",
      "salmon", "shrimp", "meat", "ham",
    ],
  },
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    keywords: [
      "apple", "banana", "orange", "grape", "berry", "berries", "tomato",
      "potato", "onion", "carrot", "lettuce", "spinach", "broccoli",
      "pepper", "cucumber", "avocado", "lemon", "lime", "rutabaga", "vegetable", "fruit",
      // ضفنا دول بعد ما شفنا عينة "Other" الحقيقية
      "celery", "cilantro", "ginger", "cauliflower", "garlic", "romaine",
      "zucchini", "cabbage", "pear", "pomegranate", "mango", "cantaloupe",
      "plantain", "kiwi", "plum", "asparagus", "mushroom", "parsley",
      "radish", "brussels sprout", "beet", "papaya", "persimmon", "corn",
      "peas", "leek", "okra", "mint", "dill", "herb", "coleslaw",
    ],
  },
  {
    name: "Frozen",
    slug: "frozen",
    keywords: ["frozen", "ice cream", "popsicle"],
  },
  {
    name: "Beverages",
    slug: "beverages",
    keywords: [
      "juice", "soda", "water", "coffee", "tea", "drink", "cola", "beverage",
      "ginger ale", "nectar",
    ],
  },
  {
    name: "Snacks",
    slug: "snacks",
    keywords: [
      "chips", "cookie", "cracker", "chocolate", "candy", "snack", "popcorn",
      "nuts", "cashew", "almond", "marshmallow",
    ],
  },
  {
    name: "Pantry & Grocery",
    slug: "pantry-grocery",
    keywords: [
      "rice", "pasta", "flour", "sugar", "oil", "sauce", "spice", "cereal",
      "soup", "canned", "beans", "vinegar", "salt", "mayonnaise",
      "spaghetti", "macaroni", "olive",
    ],
  },
  {
    name: "Household",
    slug: "household",
    keywords: ["detergent", "cleaner", "tissue", "paper towel", "toilet paper", "soap", "trash bag"],
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    keywords: ["shampoo", "toothpaste", "deodorant", "lotion", "razor", "vitamin"],
  },
];

const OTHER_CATEGORY = { name: "Other", slug: "other" };

async function classify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");

    // 1. تأكد إن كل الكاتيجوريز موجودة (أو اعملها لو مش موجودة)
    const categoryMap = {}; // slug -> categoryId

    for (const rule of [...CATEGORY_RULES, OTHER_CATEGORY]) {
      const category = await Category.findOneAndUpdate(
        { slug: rule.slug },
        { name: rule.name, slug: rule.slug },
        { upsert: true, new: true }
      );
      categoryMap[rule.slug] = category._id;
    }

    console.log(`Ensured ${Object.keys(categoryMap).length} categories exist`);

    // 2. هات كل المنتجات اللي لسه من غير category
    const products = await Product.find({
        $or: [
          { category: null },
          { category: { $exists: false } },
          { category: categoryMap["other"] },
        ],
      }).select("_id name");

    console.log(`Classifying ${products.length} products...`);

    const bulkOps = [];

    for (const product of products) {
      const nameLower = (product.name || "").toLowerCase();
      let matchedSlug = "other";

      for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some((kw) => nameLower.includes(kw))) {
          matchedSlug = rule.slug;
          break;
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { category: categoryMap[matchedSlug] } },
        },
      });
    }

    // batch الـ update عشان الأداء
    const BATCH_SIZE = 500;
    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      await Product.bulkWrite(batch);
      console.log(`Processed ${i + batch.length}/${bulkOps.length}`);
    }

    console.log("Done classifying products.");
    process.exit(0);
  } catch (error) {
    console.error("Classification failed:", error);
    process.exit(1);
  }
}

classify();