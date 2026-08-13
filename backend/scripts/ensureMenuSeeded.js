const fs = require('fs');
const path = require('path');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const slugify = (value) => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

let cachedMenu = null;

function loadMenu() {
  if (cachedMenu) return cachedMenu;

  const seedPath = path.join(__dirname, 'seedMenu.js');
  const source = fs.readFileSync(seedPath, 'utf8');
  const match = source.match(/const MENU = (\[[\s\S]*?\]);\n\nconst slugify/);
  if (!match) throw new Error('Could not load menu seed data');

  cachedMenu = Function(`"use strict"; return (${match[1]});`)();
  return cachedMenu;
}

async function ensureMenuSeeded() {
  const MENU = loadMenu();
  const categoryNames = [...new Set(MENU.map((item) => item.category))];
  const categoryIds = new Map();

  for (const [index, name] of categoryNames.entries()) {
    const category = await Category.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), active: true, sortOrder: index },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(name, category._id);
  }

  for (const item of MENU) {
    await MenuItem.findOneAndUpdate(
      { name: item.name, category: categoryIds.get(item.category) },
      { ...item, category: categoryIds.get(item.category), available: true },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  return { items: MENU.length, categories: categoryNames.length };
}

module.exports = ensureMenuSeeded;
