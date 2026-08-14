require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// Safe additive seed: never deletes or disables existing menu data.
const MENU = [
  ['Burgers','Crispy Chicken Burger',149],['Burgers','Spicy Chicken Burger',159],['Burgers','Tandoori Chicken Burger',169],['Burgers','BBQ Chicken Burger',169],['Burgers','Double Chicken Burger',199],['Burgers','Cheese Chicken Burger',179],['Burgers','Chicken Club Sandwich',189],['Burgers','Grilled Chicken Sandwich',179],['Burgers','Peri Peri Chicken Burger',169],['Burgers','Veg Cheese Burger',129],
  ['Pizza [7 inches]','Margherita Pizza [7 Inches]',180],['Pizza [7 inches]','Onion Capsicum Pizza [7 Inches]',210],['Pizza [7 inches]','Corn Cheese Pizza [7 Inches]',220],['Pizza [7 inches]','Farmhouse Pizza [7 Inches]',250],['Pizza [7 inches]','Paneer Tikka Pizza [7 Inches]',270],['Pizza [7 inches]','Chicken Tikka Pizza [7 Inches]',240],['Pizza [7 inches]','BBQ Chicken Pizza [7 Inches]',280],['Pizza [7 inches]','Chicken Pepperoni Pizza [7 Inches]',290],['Pizza [7 inches]','Peri Peri Chicken Pizza [7 Inches]',290],['Pizza [7 inches]','Double Cheese Pizza [7 Inches]',250],
  ['Pasta','Classic Red Sauce Pasta',220],['Pasta','Arrabbiata Pasta',230],['Pasta','Creamy Alfredo Pasta',240],['Pasta','Penne Alfredo Pasta',240],['Pasta','Cheesy Pink Sauce Pasta',250],['Pasta','Peri Peri Pasta',240],['Pasta','Chicken Alfredo Pasta',290],['Pasta','Chicken Arrabbiata Pasta',290],['Pasta','Chicken Pink Sauce Pasta',300],['Pasta','Chicken Peri Peri Pasta',300],
  ['Wraps','Crispy Chicken Wrap',150],['Wraps','Peri Peri Chicken Wrap',165],['Wraps','Cheesy Chicken Wrap',175],['Wraps','BBQ Chicken Wrap',175],['Wraps','Tandoori Chicken Wrap',175],['Wraps','Chicken Tikka Wrap',180],['Wraps','Mexican Chicken Wrap',180],['Wraps','Chicken Mayo Wrap',160],['Wraps','Veggie Cheese Wrap',130],['Wraps','Paneer Tikka Wrap',160],
  ['Snacks','Chicken Nuggets [6 Pcs]',180],['Snacks','Chicken Strips [5 Pcs]',220],['Snacks','Chicken Popcorn [12 Pcs]',220],['Snacks','Chicken Wings [6 Pcs]',250],['Snacks','Peri Peri Chicken Wings [6 Pcs]',270],['Snacks','Chicken Tenders [5 Pcs]',230],['Snacks','Chicken Cheese Balls [6 Pcs]',220],['Snacks','Crispy Chicken Bites',220],['Snacks','Chicken Seekh Kebab',240],['Snacks','Chicken Tikka Bites',250],
  ['Fries & Sides','Classic Salted Fries',130],['Fries & Sides','Peri Peri Fries',150],['Fries & Sides','Cheese Fries',190],['Fries & Sides','Loaded Chicken Fries',280],['Fries & Sides','BBQ Chicken Fries',270],['Fries & Sides','Masala Fries',140],['Fries & Sides','Garlic Bread',160],['Fries & Sides','Cheese Garlic Bread',190],['Fries & Sides','Potato Wedges',160],['Fries & Sides','Cheesy Potato Wedges',210],
  ['Cheesesteak','Classic Chicken Cheesesteak',240],['Cheesesteak','Spicy Chicken Cheesesteak',260],['Cheesesteak','Chicken Tikka Cheesesteak',290],['Cheesesteak','BBQ Chicken Cheesesteak',280],['Cheesesteak','Peri Peri Chicken Cheesesteak',280],['Cheesesteak','Cheesy Chicken Cheesesteak',290],['Cheesesteak','Double Cheese Chicken Cheesesteak',320],['Cheesesteak','Mexican Chicken Cheesesteak',290],['Cheesesteak','Mushroom Cheese Steak',250],['Cheesesteak','Veg Cheese Steak',220],
  ['Mojitos & Coolers','Classic Mint Mojito',150],['Mojitos & Coolers','Blue Lagoon Mojito',160],['Mojitos & Coolers','Green Apple Mojito',160],['Mojitos & Coolers','Watermelon Mojito',160],['Mojitos & Coolers','Strawberry Mojito',160],['Mojitos & Coolers','Peach Mojito',160],['Mojitos & Coolers','Kala Khatta Mojito',160],['Mojitos & Coolers','Mango Mojito',160],['Mojitos & Coolers','Lemon Mint Cooler',150],['Mojitos & Coolers','Berry Lemon Cooler',170],
  ['Coffee & Shakes','Classic Cold Coffee',160],['Coffee & Shakes','Hazelnut Cold Coffee',179],['Coffee & Shakes','Irish Cold Coffee',179],['Coffee & Shakes','Java Chip Cold Coffee',189],['Coffee & Shakes','Cappuccino',140],['Coffee & Shakes','Cafe Latte',150],['Coffee & Shakes','Chocolate Shake',170],['Coffee & Shakes','Strawberry Shake',170],['Coffee & Shakes','Mango Shake',170],['Coffee & Shakes','Butterscotch Shake',170],
  ['Desserts','Chocolate Brownie',120],['Desserts','Brownie With Ice Cream',180],['Desserts','Chocolate Lava Cake',170],['Desserts','Chocolate Sundae',160],['Desserts','Vanilla Sundae',150],['Desserts','Oreo Sundae',180],['Desserts','Nutella Brownie',190],['Desserts','Choco Chip Cookie',90],['Desserts','New York Cheesecake',190],['Desserts','Gulab Jamun With Ice Cream',170],
  ['Healthy Bowls & Salads','Grilled Chicken Caesar Salad',280],['Healthy Bowls & Salads','Peri Peri Chicken Salad',290],['Healthy Bowls & Salads','Chicken Tikka Salad Bowl',300],['Healthy Bowls & Salads','Mexican Chicken Rice Bowl',310],['Healthy Bowls & Salads','Teriyaki Chicken Rice Bowl',320],['Healthy Bowls & Salads','Grilled Paneer Rice Bowl',280],['Healthy Bowls & Salads','Mediterranean Veg Salad',240],['Healthy Bowls & Salads','Corn & Bean Salad Bowl',230],['Healthy Bowls & Salads','Fresh Garden Salad',180],['Healthy Bowls & Salads','Protein Chicken Bowl',330],
];

const slugify = (v) => String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
(async () => {
  await connectDB();
  const categories = new Map();
  for (const [index, name] of [...new Set(MENU.map(x => x[0]))].entries()) {
    const category = await Category.findOneAndUpdate({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name), description: `${name} at Ilarooh`, active: true, sortOrder: 20 + index } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    categories.set(name, category._id);
  }
  let added = 0;
  for (const [category, name, price] of MENU) {
    const result = await MenuItem.updateOne({ name, category: categories.get(category) }, { $setOnInsert: { name, category: categories.get(category), price, description: `Freshly prepared ${name.toLowerCase()}.`, available: true, vegetarian: category === 'Desserts' || category === 'Coffee & Shakes' || category === 'Mojitos & Coolers' || (category === 'Pizza [7 inches]' && !/Chicken/i.test(name)) || (category === 'Healthy Bowls & Salads' && !/Chicken/i.test(name)) } }, { upsert: true });
    if (result.upsertedCount) added += 1;
  }
  console.log(`Expanded menu ensured: ${MENU.length} target items across 11 categories; ${added} new items inserted.`);
  await mongoose.disconnect();
})().catch(async e => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
