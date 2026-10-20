require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const CATEGORIES = [
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Useful upgrades for every room.', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85', sortOrder: 1 },
  { name: 'Tech Accessories', slug: 'tech-accessories', description: 'Everyday tech and smart accessories.', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85', sortOrder: 2 },
  { name: 'Beauty & Care', slug: 'beauty-care', description: 'Simple essentials for daily routines.', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85', sortOrder: 3 },
  { name: 'Everyday Utility', slug: 'everyday-utility', description: 'Practical things that make life easier.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85', sortOrder: 4 },
];

const PRODUCTS = [
  { name: 'Minimal Desk Lamp', sku: 'ZRC-HOME-001', brand: 'Zrcart', category: 'home-kitchen', price: 699, compareAtPrice: 999, stock: 25, badge: 'Bestseller', popular: true, description: 'A clean, modern desk lamp for workspaces and bedside tables.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Calm Home Accent', sku: 'ZRC-HOME-002', brand: 'Zrcart', category: 'home-kitchen', price: 549, compareAtPrice: 799, stock: 18, badge: 'New', popular: true, description: 'A simple home accent that adds a considered finishing touch.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85' },
  { name: 'Everyday Wireless Earbuds', sku: 'ZRC-TECH-001', brand: 'Zrcart', category: 'tech-accessories', price: 1299, compareAtPrice: 1799, stock: 30, badge: 'Trending', popular: true, description: 'Compact wireless earbuds for music, calls and daily commutes.', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85' },
  { name: 'Wireless On-Ear Headphones', sku: 'ZRC-TECH-002', brand: 'Zrcart', category: 'tech-accessories', price: 1599, compareAtPrice: 2199, stock: 15, badge: 'Top rated', popular: false, description: 'Comfortable everyday headphones with a clean, minimal look.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85' },
  { name: 'Daily Care Essentials Set', sku: 'ZRC-CARE-001', brand: 'Zrcart', category: 'beauty-care', price: 449, compareAtPrice: 599, stock: 24, badge: 'Popular', popular: true, description: 'A practical set of daily care essentials for your routine.', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85' },
  { name: 'Daily Hydration Cream', sku: 'ZRC-CARE-002', brand: 'Zrcart', category: 'beauty-care', price: 399, compareAtPrice: 549, stock: 20, badge: '', popular: false, description: 'A lightweight daily hydration essential.', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85' },
  { name: 'Compact Travel Organizer', sku: 'ZRC-UTIL-001', brand: 'Zrcart', category: 'everyday-utility', price: 349, compareAtPrice: 499, stock: 40, badge: 'Great value', popular: true, description: 'Keep daily carry items neatly organized at home or on the go.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { name: 'Everyday Carry Tote', sku: 'ZRC-UTIL-002', brand: 'Zrcart', category: 'everyday-utility', price: 499, compareAtPrice: 699, stock: 22, badge: 'Just in', popular: false, description: 'A versatile tote for errands, work and everyday essentials.', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85' },
];

async function seedCatalog() {
  const replace = process.argv.includes('--replace');
  await connectDB();

  const categoryIds = new Map();
  for (const categoryData of CATEGORIES) {
    const category = await Category.findOneAndUpdate(
      { slug: categoryData.slug },
      { ...categoryData, active: true },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(category.slug, category._id);
  }

  const seededIds = [];
  for (const productData of PRODUCTS) {
    const categoryId = categoryIds.get(productData.category);
    const product = await MenuItem.findOneAndUpdate(
      { sku: productData.sku },
      { ...productData, category: categoryId, available: true, vegetarian: false },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    seededIds.push(product._id);
  }

  if (replace) {
    await MenuItem.updateMany({ _id: { $nin: seededIds } }, { $set: { available: false } });
    await Category.updateMany({ slug: { $nin: CATEGORIES.map((category) => category.slug) } }, { $set: { active: false } });
    console.log('Legacy food products were marked unavailable and legacy categories were archived (not deleted).');
  }

  console.log(`Zrcart catalog seeded: ${PRODUCTS.length} products, ${CATEGORIES.length} categories.`);
  await mongoose.disconnect();
}

seedCatalog().catch(async (error) => {
  console.error('Zrcart catalog seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
