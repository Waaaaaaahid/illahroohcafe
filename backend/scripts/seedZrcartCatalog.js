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
  { name: 'Manual Kitchen Chopper', sku: 'ZRC-HOME-001', brand: 'Zrcart', category: 'home-kitchen', price: 299, compareAtPrice: 499, stock: 35, badge: 'Bestseller', popular: true, description: 'Compact manual pull-cord chopper for quickly chopping onions, herbs, fruit and vegetables.', image: { url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'Sink Cleaning Brush', sku: 'ZRC-HOME-002', brand: 'Zrcart', category: 'home-kitchen', price: 149, compareAtPrice: 249, stock: 40, badge: 'Everyday essential', popular: true, description: 'A handy scrub brush for kitchen sinks, dishes and hard-to-reach corners.', image: { url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'Wireless Earbuds', sku: 'ZRC-TECH-001', brand: 'Zrcart', category: 'tech-accessories', price: 799, compareAtPrice: 1299, stock: 30, badge: 'Trending', popular: true, description: 'Compact wireless earbuds for music, calls and everyday commutes.', image: { url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'LED Keyboard Keychain', sku: 'ZRC-TECH-002', brand: 'Zrcart', category: 'tech-accessories', price: 199, compareAtPrice: 299, stock: 50, badge: 'Fun find', popular: true, description: 'A tiny keyboard-style LED keychain accessory for bags, keys and tech lovers.', image: { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'Daily Care Essentials Set', sku: 'ZRC-CARE-001', brand: 'Zrcart', category: 'beauty-care', price: 249, compareAtPrice: 399, stock: 24, badge: 'Popular', popular: true, description: 'A practical everyday personal-care kit for your travel bag and daily routine.', image: { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'Nail Care Clipper Set', sku: 'ZRC-CARE-002', brand: 'Zrcart', category: 'beauty-care', price: 129, compareAtPrice: 199, stock: 45, badge: '', popular: false, description: 'Compact nail grooming tools for neat everyday personal care at home or while travelling.', image: { url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'Travel Storage Organizer', sku: 'ZRC-UTIL-001', brand: 'Zrcart', category: 'everyday-utility', price: 249, compareAtPrice: 399, stock: 40, badge: 'Great value', popular: true, description: 'A lightweight organizer to keep small essentials sorted in a backpack, handbag or suitcase.', image: { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=2400&q=90' } },
  { name: 'Everyday Carry Tote', sku: 'ZRC-UTIL-002', brand: 'Zrcart', category: 'everyday-utility', price: 299, compareAtPrice: 499, stock: 22, badge: 'Just in', popular: false, description: 'A reusable everyday tote for errands, shopping and carrying daily essentials.', image: { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=2400&q=90' } },
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
