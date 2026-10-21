const CATEGORIES = [
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Useful upgrades for every room.', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85', sortOrder: 1 },
  { name: 'Electronics & Accessories', slug: 'electronics-accessories', description: 'Everyday tech and smart accessories.', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85', sortOrder: 2 },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Handy add-ons for your phone.', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85', sortOrder: 3 },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Everyday grooming and personal-care tools.', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85', sortOrder: 4 },
  { name: 'Bags & Travel', slug: 'bags-travel', description: 'Organizers and bags for life on the go.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85', sortOrder: 5 },
  { name: 'Cleaning Supplies', slug: 'cleaning-supplies', description: 'Practical tools for everyday cleaning.', image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=900&q=85', sortOrder: 6 },
  { name: 'Storage & Organization', slug: 'storage-organization', description: 'Keep everyday essentials neat and tidy.', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', sortOrder: 7 },
  { name: 'Car Accessories', slug: 'car-accessories', description: 'Useful accessories for daily drives.', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85', sortOrder: 8 },
  { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Small upgrades for a tidier bathroom.', image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=85', sortOrder: 9 },
  { name: 'Stationery & Office', slug: 'stationery-office', description: 'Useful desk and stationery essentials.', image: 'https://images.unsplash.com/photo-1455390582262-044c52a2d0c4?auto=format&fit=crop&w=900&q=85', sortOrder: 10 },
  { name: 'Fashion Accessories', slug: 'fashion-accessories', description: 'Finishing touches for everyday outfits.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85', sortOrder: 11 },
  { name: 'Gifts & Novelty', slug: 'gifts-novelty', description: 'Fun finds and little gifts for any occasion.', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=85', sortOrder: 12 },
];

const PRODUCT_NAMES = {
  'home-kitchen': ['Manual Kitchen Chopper', 'Sink Cleaning Brush', 'Silicone Spatula Set', 'Measuring Spoon Set', 'Oil Dispenser Bottle', 'Reusable Food Storage Bags', 'Vegetable Peeler', 'Dishwashing Soap Dispenser', 'Kitchen Sink Strainer', 'Foldable Pot Lid Holder'],
  'electronics-accessories': ['Wireless Earbuds', 'LED Keyboard Keychain', 'USB-C Charging Cable', 'Multi-Port USB Hub', 'Wireless Mouse', 'Laptop Cooling Stand', 'Bluetooth Speaker', 'Cable Organizer Clips', 'Phone Charging Adapter', 'Rechargeable LED Desk Light'],
  'mobile-accessories': ['Universal Phone Stand', 'Shockproof Phone Case', 'Tempered Glass Screen Protector', 'Adjustable Car Phone Mount', 'Pop Grip Phone Holder', 'Braided Charging Cable', 'Foldable Phone Tripod', 'Waterproof Phone Pouch', 'Camera Lens Protector', 'Phone Ring Holder'],
  'beauty-personal-care': ['Daily Care Essentials Set', 'Nail Care Clipper Set', 'Facial Cleansing Brush', 'Travel Makeup Organizer', 'Hair Styling Comb Set', 'Reusable Makeup Remover Pads', 'Compact Vanity Mirror', 'Silicone Scalp Massager', 'Makeup Brush Set', 'Grooming Travel Kit'],
  'bags-travel': ['Travel Storage Organizer', 'Everyday Carry Tote', 'Packing Cube Set', 'Travel Toiletry Pouch', 'Foldable Shopping Bag', 'Passport Holder', 'Water-Resistant Shoe Bag', 'Compact Sling Bag', 'Luggage Tag Set', 'Cable Travel Pouch'],
  'cleaning-supplies': ['Microfiber Cleaning Cloths', 'Multi-Purpose Scrub Brush', 'Reusable Lint Roller', 'Window Cleaning Squeegee', 'Dusting Brush Set', 'Grout Cleaning Brush', 'Extendable Duster', 'Shoe Cleaning Brush', 'Reusable Cleaning Gloves', 'Detail Cleaning Brush Set'],
  'storage-organization': ['Drawer Organizer Tray', 'Stackable Storage Box', 'Closet Organizer Bags', 'Cable Management Box', 'Under-Shelf Storage Basket', 'Foldable Fabric Storage Bin', 'Desk Organizer Caddy', 'Reusable Label Stickers', 'Jewellery Storage Case', 'Multipurpose Hook Set'],
  'car-accessories': ['Car Seat Gap Organizer', 'Dashboard Phone Holder', 'Car Cleaning Gel', 'Microfiber Car Duster', 'Seat-Back Organizer', 'Car Trash Bin', 'Car Sunshade Pair', 'Car Air Vent Clip Holder', 'Car Boot Storage Net', 'Tyre Pressure Gauge'],
  'bathroom-accessories': ['Wall-Mounted Toothbrush Holder', 'Liquid Soap Dispenser', 'Quick-Dry Bath Mat', 'Shower Caddy Basket', 'Toothpaste Squeezer', 'Drain Hair Catcher', 'Bathroom Cleaning Brush', 'Towel Hooks Set', 'Travel Toiletry Bottles', 'Waterproof Shower Pouch'],
  'stationery-office': ['Desk Pen Holder', 'Sticky Notes Pack', 'A5 Notebook Set', 'Retractable Gel Pens', 'Document Organizer Folder', 'Desktop Cable Clips', 'Page Marker Tabs', 'Mini Stapler Set', 'Whiteboard Marker Set', 'Adjustable Book Stand'],
  'fashion-accessories': ['Classic Wallet', 'Adjustable Everyday Belt', 'Baseball Cap', 'Polarized Style Sunglasses', 'Minimalist Wristwatch', 'Keychain Wallet', 'Hair Claw Clip Set', 'Unisex Winter Beanie', 'Fashion Bracelet Set', 'Compact Card Holder'],
  'gifts-novelty': ['LED Mini Keychain Light', 'Cute Desk Figurine', 'Personalized-Style Photo Frame', 'Mini Gift Box Set', 'Novelty Keychain Set', 'Decorative String Lights', 'Pocket Notebook Gift Set', 'Mini Desktop Game', 'Reusable Gift Wrap Set', 'Greeting Card Bundle'],
};

const CATEGORY_IMAGES = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category.image]));
const SKU_OVERRIDES = {
  'Manual Kitchen Chopper': 'ZRC-HOME-001',
  'Sink Cleaning Brush': 'ZRC-HOME-002',
  'Wireless Earbuds': 'ZRC-TECH-001',
  'LED Keyboard Keychain': 'ZRC-TECH-002',
  'Daily Care Essentials Set': 'ZRC-CARE-001',
  'Nail Care Clipper Set': 'ZRC-CARE-002',
  'Travel Storage Organizer': 'ZRC-UTIL-001',
  'Everyday Carry Tote': 'ZRC-UTIL-002',
};

const PRODUCTS = CATEGORIES.flatMap((category) =>
  PRODUCT_NAMES[category.slug].map((name, index) => ({
    name,
    sku: SKU_OVERRIDES[name] || `ZRC-${category.slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 12)}-${String(index + 1).padStart(3, '0')}`,
    brand: 'Zrcart',
    category: category.slug,
    price: [99, 149, 199, 249, 299, 349, 399, 449, 499, 599][(index + category.sortOrder) % 10],
    compareAtPrice: [149, 199, 299, 349, 399, 449, 499, 599, 699, 799][(index + category.sortOrder) % 10],
    stock: 20 + ((index * 7 + category.sortOrder) % 35),
    badge: index === 0 ? 'Popular' : index === 1 ? 'Great value' : '',
    popular: index < 2,
    description: `${name} — a practical everyday ${category.name.toLowerCase()} essential from Zrcart. Product details and specifications can be updated in the admin panel.`,
    image: { url: CATEGORY_IMAGES[category.slug] },
  }))
);

module.exports = { CATEGORIES, PRODUCTS };
