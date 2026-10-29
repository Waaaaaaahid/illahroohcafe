const mongoose = require('mongoose');
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

async function ensureMenuSeeded() {
  // Vercel creates new serverless instances. Once the one-time catalog migration
  // has completed, avoid upserting every category and product on every cold start.
  const migrations = mongoose.connection.collection('catalogmigrations');
  const migrationKey = 'zrcart-commerce-catalog-v3';
  const existingMigration = await migrations.findOne({ _id: migrationKey });
  if (existingMigration) {
    return {
      items: existingMigration.seededProductCount ?? PRODUCTS.length,
      categories: existingMigration.activeCategorySlugs?.length ?? CATEGORIES.length,
      migrationApplied: false,
      skipped: true,
    };
  }

  const categoryIds = new Map();
  for (const categoryData of CATEGORIES) {
    const category = await Category.findOneAndUpdate(
      { slug: categoryData.slug },
      { $set: { ...categoryData, active: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(categoryData.slug, category._id);
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

  // One-time migration: retire the old restaurant catalog and any products outside
  // the initial Zrcart seed. Products added later through admin remain untouched.
  const migration = null;
  if (!migration) {
    const activeSlugs = CATEGORIES.map((category) => category.slug);
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
    await MenuItem.updateMany(
      { _id: { $nin: seededIds }, name: { $not: LEGACY_FOOD_NAME_PATTERN } },
      { $set: { available: false } },
    );
    await Category.updateMany(
      { slug: { $nin: activeSlugs } },
      { $set: { active: false } },
    );
    await migrations.updateOne(
      { _id: migrationKey },
      { $setOnInsert: { completedAt: new Date(), seededProductCount: PRODUCTS.length, activeCategorySlugs: activeSlugs } },
      { upsert: true },
    );
  }

  return { items: PRODUCTS.length, categories: CATEGORIES.length, migrationApplied: !migration };
}

module.exports = ensureMenuSeeded;
