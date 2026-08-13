require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const MENU = [
  {"category":"Burgers","name":"Chicken Zinger Burger","price":165,"description":"","vegetarian":false},
  {"category":"Burgers","name":"Chicken Chilli Zinger Burger","price":175,"description":"","vegetarian":false},
  {"category":"Burgers","name":"Chicken Snacker Burger","price":100,"description":"","vegetarian":false},
  {"category":"Burgers","name":"Barbeque Chicken Zinger Burger","price":175,"description":"","vegetarian":false},
  {"category":"Burgers","name":"Tandoori Chicken Zinger Burger","price":175,"description":"","vegetarian":false},
  {"category":"Burgers","name":"Cheeza","price":250,"description":"Fried crispy chicken base topped with pizza sauce cheese.","vegetarian":false},
  {"category":"Pizza [7 inches]","name":"Onion Pizza [7 Inches]","price":180,"description":"Pizza with onion topping only.","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Capsicum Pizza [7 Inches]","price":180,"description":"Pizza with capsicum topping only.","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Chicken Tikka Pizza [7 Inches]","price":240,"description":"Pizza with chicken tikka topping only.","vegetarian":false},
  {"category":"Pizza [7 inches]","name":"Corn Pizza [7 Inches]","price":180,"description":"","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Elite Pizza [7 Inches]","price":250,"description":"Pizza with onion, black olives, paprika, jalapeno and corns.","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Margherita Pizza [7 Inches]","price":180,"description":"","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Double Cheese Pizza [7 Inches]","price":250,"description":"Classic double cheese pizza.","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Triple Treat Pizza [7 Inches]","price":240,"description":"Pizza with corn, red paprika and olives toppings.","vegetarian":true},
  {"category":"Pizza [7 inches]","name":"Chicken With Veggies Pizza [7 Inches]","price":270,"description":"Pizza with paprika, olives, corn, jalapeno and chicken.","vegetarian":false},
  {"category":"Pizza [7 inches]","name":"Chicken Barbeque Pizza [7 Inches]","price":230,"description":"Pizza with corn, olives, paprika and paneer toppings.","vegetarian":false},
  {"category":"Pasta","name":"White Sauce Baked Pasta","price":260,"description":"","vegetarian":true},
  {"category":"Pasta","name":"Tangy Cheese Baked Pasta","price":260,"description":"","vegetarian":true},
  {"category":"Pasta","name":"Baked White Sauce Pasta With Chicken","price":290,"description":"","vegetarian":false},
  {"category":"Wraps","name":"Chicken Wrap","price":165,"description":"A flavorful grilled wrap featuring a soft tortilla base filled with crispy fried chicken, seasoned with our homemade masala for a mild spice. Served with a [8g] ketchup sachet for dipping.","vegetarian":false},
  {"category":"Wraps","name":"Tangy Chicken Wrap","price":175,"description":"","vegetarian":false},
  {"category":"Wraps","name":"Tandoori Chicken Wrap","price":175,"description":"","vegetarian":false},
  {"category":"Wraps","name":"Barbeque Chicken Wrap","price":175,"description":"","vegetarian":false},
  {"category":"Snacks","name":"Regular Fries","price":150,"description":"","vegetarian":true},
  {"category":"Snacks","name":"Chicken Popcorn","price":250,"description":"Enjoy tender, bite sized chicken popcorn seasoned with our homemade blend of peri peri inspired spices. Soft on the inside and perfectly seasoned, each serving comes with a delicious dip.","vegetarian":false},
  {"category":"Snacks","name":"Chicken Wings","price":250,"description":"","vegetarian":false},
  {"category":"Snacks","name":"Peri Peri Fries","price":180,"description":"","vegetarian":true},
  {"category":"Snacks","name":"Cheese Loaded Fries","price":250,"description":"Crispy fries smothered [ veg preparation] in cheese, topped with a mild spicy sausage sauce.","vegetarian":true},
  {"category":"Snacks","name":"Chicken Cheese Fries","price":300,"description":"Crispy fries loaded with sausages and topped with flavorful chicken tikka.","vegetarian":false},
  {"category":"Snacks","name":"Cheese Loaded Chicken Popcorn","price":300,"description":"","vegetarian":false},
  {"category":"Snacks","name":"Boneless Chicken Strip","price":300,"description":"Crispy fried chicken strip.","vegetarian":false},
  {"category":"Snacks","name":"Chicken Munchi","price":120,"description":"Baked Italian bread stuffed with chicken cheese and vegetables.","vegetarian":false},
  {"category":"Drinks (Beverages)","name":"Butterscotch Milkshake","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Cold Coffee","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Classic Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Blue Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Strawberry Shake","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Mango Shake","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Pineapple Shake","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Rasmalai Shake","price":159,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Masala Lemonade Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Chocolate Brownie Shake","price":179,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Chilli Guava Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Spicy Mango Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Blueberry Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Kala Khatta Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Masala Coke","price":120,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Peach Iced Tea","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Hazelnut Cold Coffee","price":179,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Irish Cold Coffee","price":179,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Java Chip Cold Coffee","price":179,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Litchi Soda Boba","price":170,"description":"Litchi soda with boba pearls.","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Coffee Boba","price":250,"description":"Cold coffee with boba pearls.","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Chocolate Boba","price":250,"description":"Chocolate shake with boba pearls.","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Taro Boba","price":250,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Chocolate Milkshake","price":160,"description":"","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Green Mint Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Watermelon Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Green Apple Mojito","price":160,"description":"[Non Alcoholic]","vegetarian":true},
  {"category":"Drinks (Beverages)","name":"Coconut Cold Coffee","price":160,"description":"","vegetarian":true},
  {"category":"Cheesesteak","name":"Chicken Cheesesteak Spicy","price":240,"description":"Chicken cheesesteak with cheese slices.","vegetarian":false},
  {"category":"Cheesesteak","name":"Spicy Chicken Cheesesteak With Melted Mozzarella","price":300,"description":"Spicy chicken cheesesteak with cheese slices and melted Mozzarella.","vegetarian":false},
  {"category":"Cheesesteak","name":"Chicken Tikka Cheesesteak","price":240,"description":"US Philadelphia style cheesesteak, with chicken tikka, long bun and mayo, cheese slice.","vegetarian":false},
  {"category":"Cheesesteak","name":"Chicken Cheesesteak Classic","price":240,"description":"A mildly spiced cheesesteak with cheese slice featuring tender chicken seasoned with our homemade spices. Served with two 8g sachets of tomato ketchup.","vegetarian":false}
];

const slugify = (value) => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function seedMenu() {
  const replace = process.argv.includes('--replace');
  await connectDB();

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

  if (replace) {
    const names = MENU.map((item) => item.name);
    const categoryObjectIds = [...categoryIds.values()];
    await MenuItem.updateMany(
      { name: { $nin: names }, category: { $in: categoryObjectIds } },
      { $set: { available: false } },
    );
  }

  console.log(`Ilarooh menu seeded: ${MENU.length} items, ${categoryNames.length} categories.`);
  if (replace) console.log('Replace mode: unmatched items were marked unavailable.');
  await mongoose.disconnect();
}

seedMenu().catch(async (error) => {
  console.error('Menu seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
