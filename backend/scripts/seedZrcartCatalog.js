require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const { CATEGORIES, PRODUCTS } = require('./zrcartCatalogData');

const LEGACY_FOOD_SLUGS = [
  'beverages', 'coffee', 'desserts', 'pizza', 'burgers', 'pizza-7-inches',
  'pasta', 'wraps', 'snacks', 'drinks-beverages', 'cheesesteak',
  'fries-sides', 'mojitos-coolers', 'coffee-shakes', 'healthy-bowls-salads',
  'salads', 'drinks', 'milkshakes', 'sides', 'starters', 'main-course',
];
const LEGACY_FOOD_NAME_PATTERN = /burger|pizza|pasta|wrap|fries|coffee|shake|mojito|cooler|dessert|brownie|cake|sundae|cookie|cheesecake|salad|nugget|sandwich|cheesesteak|steak|garlic bread|chicken|wings|kebab|tikka|beverage|\\bdrinks?\\b|latte|cappuccino|milkshake|smoothie|ice cream|soft drink|soda|lemonade|juice/i;

async function seedCatalog() {
  const replace = process.argv.includes('--replace');
  await connectDB();

  const categoryIds = new Map();
  for (const categoryData of CATEGORIES) {
    const category = await Category.findOneAndUpdate(
      { slug: categoryData.slug },
      { $set: { ...categoryData, active: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(category.slug, category._id);
  }

  const seededIds = [];
  for (const productData of PRODUCTS) {
    const product = await MenuItem.findOneAndUpdate(
      { sku: productData.sku },
      { $set: { ...productData, category: categoryIds.get(productData.category), available: true, vegetarian: false } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    seededIds.push(product._id);
  }

  // Always retire the old restaurant-food catalog.
  const legacyCategories = await Category.find({
    $or: [
      { slug: { $in: LEGACY_FOOD_SLUGS } },
      { name: LEGACY_FOOD_NAME_PATTERN },
    ],
  }).select('_id');
  const legacyIds = legacyCategories.map((category) => category._id);
  if (legacyIds.length) {
    await MenuItem.deleteMany({ category: { $in: legacyIds } });
    await Category.deleteMany({ _id: { $in: legacyIds } });
  }
  await MenuItem.deleteMany({
    _id: { $nin: seededIds },
    name: LEGACY_FOOD_NAME_PATTERN,
  });

  // --replace makes the 120 seeded products the complete active catalog.
  if (replace) {
    await MenuItem.updateMany({ _id: { $nin: seededIds } }, { $set: { available: false } });
    await Category.updateMany(
      { slug: { $nin: CATEGORIES.map((category) => category.slug) } },
      { $set: { active: false } },
    );
  }

  console.log(`Zrcart catalog seeded: ${PRODUCTS.length} products across ${CATEGORIES.length} categories (10 per category).`);
  await mongoose.disconnect();
}

seedCatalog().catch(async (error) => {
  console.error('Zrcart catalog seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
