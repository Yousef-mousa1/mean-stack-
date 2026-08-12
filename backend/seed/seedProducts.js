
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Product = require("../src/models/Product");
const Category = require("../src/models/Category");

// ---------- الإعدادات ----------

const IMAGES_DIR = path.join(__dirname, "category-images");
const RESET = process.argv.includes("--reset");
// الصور هتتنسخ هنا وتتقرأ Static من Express (لازم تعمل express.static على الفولدر ده)
const PUBLIC_IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const PUBLIC_IMAGES_URL_PREFIX = "/images";

// ---------- تصنيف الكاتيجوري حسب اسم الملف ----------
// الترتيب مهم: أول match بيكسب، فالأكتر تحديدًا لازم يكون فوق

const CATEGORY_RULES = [
  {
    name: "Household",
    slug: "household",
    keywords: [
      "Ajax", "Clorox", "Dettol", "Fabuloso", "Fairy", "Lysol",
      "Rosey_Granite", "Vanish", "Windex", "Ultra_Downy",
    ],
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    keywords: [
      "Colgate", "Head_And_Shoulders", "Listerine", "Nivea",
      "Oral_B", "Softsoap",
    ],
  },
  {
    name: "Frozen",
    slug: "frozen",
    keywords: [
      "Ice_Cream", "Cornetto", "Efe_Napolitano", "Ozmo_Cornet", "Uni_Cornetto",
    ],
  },
  {
    name: "Beverages",
    slug: "beverages",
    keywords: [
      "7Up", "CocaCola", "Sprite", "Pepsi", "Monster_Energy",
      "RedBull", "Sting_Energy", "^Juice",
    ],
  },
  {
    name: "Snacks",
    slug: "snacks",
    keywords: [
      "Cadbury", "Ferrero_Rocher", "Feastables", "KitKat", "Kinder",
      "MMs_", "Milka", "Nutella", "Oreo",
      "Doritos", "Lays_", "Piattos", "Tortilla_Chips", "Takis_Fuego",
    ],
  },
  {
    name: "Bakery",
    slug: "bakery",
    keywords: [
      "Croissant", "Baguette", "Sandwich_Sliced_Bread", "Brioche",
      "Whole_Grain_Soft_Sprouted_Grain_Bread", "Bagels", "Soft_Milk_Bread",
    ],
  },
  {
    name: "Meat & Seafood",
    slug: "meat-seafood",
    keywords: [
      "Ground_Beef", "Chicken", "Boerewors", "Beef_", "Lamb_Chops",
      "Ham", "Pepperoni", "Frankfurters", "Prosciutto", "Turkey",
      "Worst_Saucisson", "Shrimp", "Salmon", "Gambas", "Polpo", "Tuna_Chunks",
    ],
  },
  {
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    keywords: [
      "Milk", "Almarai", "Alpro", "Juhayna", "Sour-Cream", "Sour-Milk",
      "Oatghurt", "Soyghurt", "Yoghurt", "Eggs",
    ],
  },
  {
    name: "Pantry & Grocery",
    slug: "pantry-grocery",
    keywords: [
      "Arroz", "Rice", "Pasta", "Spaghetti", "Farfalle", "Corn_Starch",
      "Sunflower_Oil", "Azeitonas", "Ketchup", "Turmeric",
    ],
  },
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    keywords: [
      "Apple", "Asparagus", "Aubergine", "Avocado", "Banana", "Cabbage",
      "Carrots", "Cucumber", "Garlic", "Ginger", "Kiwi", "Leek", "Lemon",
      "Lime", "Mango", "Melon", "Mushroom", "Nectarine", "Onion", "Orange",
      "Papaya", "Passion-Fruit", "Peach", "Pear", "Pepper", "Pineapple",
      "Plum", "Pomegranate", "Potato", "Red-Beet", "Red-Grapefruit",
      "Satsumas", "Tomato", "Watermelon", "Zucchini", "Grapes",
      "Blueberries", "Strawberries",
    ],
  },
];

const DEFAULT_CATEGORY = {
  name: "Pantry & Grocery",
  slug: "pantry-grocery",
};

// نطاق سعر تقريبي (بالجنيه) لكل كاتيجوري
const PRICE_RANGES = {
  household: [45, 150],
  "personal-care": [35, 180],
  frozen: [40, 160],
  beverages: [15, 60],
  snacks: [15, 120],
  bakery: [20, 90],
  "meat-seafood": [100, 450],
  "dairy-eggs": [25, 110],
  "pantry-grocery": [20, 200],
  "fruits-vegetables": [8, 60],
};

// ---------- استنتاج بيانات المنتج من اسم الملف ----------

function classifyCategory(baseName) {
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const pattern = kw.startsWith("^")
        ? new RegExp("^" + kw.slice(1), "i")
        : new RegExp(kw, "i");
      if (pattern.test(baseName)) return rule;
    }
  }
  return DEFAULT_CATEGORY;
}

function extractSize(baseName) {
  const match = baseName.match(
    /(\d+(?:\.\d+)?)\s*(ml|L|kg|g|oz|lbs?|pcs?|pack)/i
  );
  if (!match) return { unit: "pc", packageSize: null };
  return {
    unit: match[2].toLowerCase(),
    packageSize: `${match[1]}${match[2]}`,
  };
}

function extractBrand(words, categorySlug) {
  if (categorySlug === "fruits-vegetables") return undefined;
  if (words.length < 2) return undefined;
  return words[0];
}

function toTitleCaseName(baseName) {
  return baseName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function randomPrice([min, max]) {
  const price = min + Math.random() * (max - min);
  return Math.round(price * 100) / 100;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------- نسخ الصور لفولدر public/images محليًا ----------

function copyImagesLocally(files) {
  const results = new Map();

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  for (const file of files) {
    const src = path.join(IMAGES_DIR, file);
    const ext = path.extname(file);
    const cleanName = slugify(path.parse(file).name) + ext.toLowerCase();
    const dest = path.join(PUBLIC_IMAGES_DIR, cleanName);

    try {
      fs.copyFileSync(src, dest);
      results.set(file, `${PUBLIC_IMAGES_URL_PREFIX}/${cleanName}`);
      console.log(`  ✓ ${file} -> ${cleanName}`);
    } catch (err) {
      console.error(`  ✗ ${file} فشل النسخ: ${err.message}`);
    }
  }

  return results;
}

// ---------- السكريبت الرئيسي ----------

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI مش موجود في .env");
  }

  console.log("بنتصل بـ MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("تم الاتصال ✓");

  if (RESET) {
    console.log("--reset: بنمسح Products و Categories القدام...");
    await Product.deleteMany({});
    await Category.deleteMany({});
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

  if (files.length === 0) {
    throw new Error(`مفيش صور في ${IMAGES_DIR}`);
  }
  console.log(`لاقيت ${files.length} صورة.`);

  // 1) نسخ الصور محليًا لفولدر public/images
  console.log("\nبننسخ الصور لفولدر public/images...");
  const imageUrls = copyImagesLocally(files);

  // 2) تجهيز الكاتيجوريز المطلوبة
  const usedCategories = new Map(); // slug -> {name, slug}
  const productDrafts = [];

  for (const file of files) {
    const baseName = path.parse(file).name;
    const categoryRule = classifyCategory(baseName);
    usedCategories.set(categoryRule.slug, categoryRule);

    const name = toTitleCaseName(baseName);
    const words = name.split(" ");
    const { unit, packageSize } = extractSize(baseName);
    const brand = extractBrand(words, categoryRule.slug);
    const priceRange = PRICE_RANGES[categoryRule.slug] || PRICE_RANGES["general-groceries"];
    const price = randomPrice(priceRange);
    const hasDiscount = Math.random() < 0.25;

    productDrafts.push({
      file,
      name,
      brand,
      unit,
      packageSize,
      price,
      oldPrice: hasDiscount ? Math.round(price * 1.15 * 100) / 100 : undefined,
      categorySlug: categoryRule.slug,
      stock: Math.floor(Math.random() * 280) + 20,
    });
  }

  // 3) عمل/تحديث الكاتيجوريز في الداتا بيز
  console.log(`\nبنعمل ${usedCategories.size} كاتيجوري...`);
  const categoryIdBySlug = new Map();

  for (const { name, slug } of usedCategories.values()) {
    const category = await Category.findOneAndUpdate(
      { slug },
      { name, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryIdBySlug.set(slug, category._id);
    console.log(`  ✓ ${name}`);
  }

  // 4) عمل الـ Products
  console.log(`\nبنعمل ${productDrafts.length} منتج...`);
  let created = 0;

  for (const draft of productDrafts) {
    const imageUrl = imageUrls.get(draft.file);
    if (!imageUrl) {
      console.warn(`  ⚠ متخطي ${draft.file} (فشل نسخ الصورة)`);
      continue;
    }

    const productId = `${draft.categorySlug}-${slugify(draft.name)}`;

    await Product.findOneAndUpdate(
      { productId },
      {
        productId,
        name: draft.name,
        brand: draft.brand,
        image: imageUrl,
        price: draft.price,
        oldPrice: draft.oldPrice,
        unit: draft.unit,
        packageSize: draft.packageSize,
        category: categoryIdBySlug.get(draft.categorySlug),
        stock: draft.stock,
        isAvailable: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created++;
  }

  console.log(`\n✅ تم! ${created} منتج جاهز في ${usedCategories.size} كاتيجوري.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌ حصل خطأ:", err);
  mongoose.disconnect();
  process.exit(1);
});