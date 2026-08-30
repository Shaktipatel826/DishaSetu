require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('./models/Admin');
const Farmer = require('./models/Farmer');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const OrderDetails = require('./models/OrderDetails');
const Payment = require('./models/Payment');
const Feedback = require('./models/Feedback');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kisan-direct';
    console.log(`[Seed Script] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed Script] Connected successfully.');

    // 1. Seed / Update Admin
// 1. Seed / Update Admin
const adminEmail = 'shivamkumarmzp2@gmail.com';
const adminPassword = 'Shakti@826';

const salt = await bcrypt.genSalt(10);
const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);

let admin = await Admin.findOne({ role: 'admin' });

if (!admin) {
  admin = await Admin.create({
    name: 'System Administrator',
    email: adminEmail,
    password: hashedAdminPassword,
    role: 'admin'
  });
  console.log(`[Seed] Created Admin Account: ${adminEmail}`);
} else {
  admin.email = adminEmail;
  admin.password = hashedAdminPassword;
  await admin.save();
  console.log(`[Seed] Admin Account Updated (${adminEmail}).`);
}

    // 2. Check if we should populate demo farmers & products if empty
    const farmerCount = await Farmer.countDocuments();
    if (farmerCount === 0) {
      console.log('[Seed] Populating realistic sample marketplace data for demonstration...');

      const defaultPasswordHash = await bcrypt.hash('Kisan@123', 10);

      // Create Demo Farmers
      const farmer1 = await Farmer.create({
        name: 'Ramesh Patel',
        email: 'ramesh.farmer@kisandirect.com',
        password: defaultPasswordHash,
        phone: '+91 98260 12345',
        location: 'Sehore, Madhya Pradesh',
        role: 'farmer'
      });

      const farmer2 = await Farmer.create({
        name: 'Gurpreet Singh',
        email: 'gurpreet.farmer@kisandirect.com',
        password: defaultPasswordHash,
        phone: '+91 98140 54321',
        location: 'Ludhiana, Punjab',
        role: 'farmer'
      });

      const farmer3 = await Farmer.create({
        name: 'Mahadev Gowda',
        email: 'mahadev.farmer@kisandirect.com',
        password: defaultPasswordHash,
        phone: '+91 94480 67890',
        location: 'Mandya, Karnataka',
        role: 'farmer'
      });

      // Create Demo Customer
      const customer1 = await Customer.create({
        name: 'Priya Sharma',
        email: 'priya.customer@kisandirect.com',
        password: defaultPasswordHash,
        phone: '+91 98200 11223',
        address: 'Flat 402, Green Meadows, Andheri West, Mumbai, MH - 400053',
        role: 'customer'
      });

      const customer2 = await Customer.create({
        name: 'Amit Verma',
        email: 'amit.customer@kisandirect.com',
        password: defaultPasswordHash,
        phone: '+91 98111 22334',
        address: 'B-14, Sector 62, Noida, UP - 201301',
        role: 'customer'
      });

      // Create Sample Grain Products
      const sampleProducts = [
        {
          name: 'Sharbati Golden Premium Wheat (100% Unpolished)',
          category: 'Wheat',
          pricePerKg: 48,
          stockKg: 450,
          image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
          description: 'Authentic Sehore Sharbati wheat, famous for making extremely soft, fluffy, and naturally sweet rotis. Organically cultivated without heavy pesticides.',
          farmer: farmer1._id,
          ratingAvg: 4.8,
          ratingCount: 14
        },
        {
          name: 'Traditional Royal Basmati Rice (Aged 2 Years)',
          category: 'Rice',
          pricePerKg: 110,
          stockKg: 600,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
          description: 'Extra-long grain aromatic Basmati rice naturally aged in Punjab granaries. Non-sticky texture and unforgettable fragrance when cooked.',
          farmer: farmer2._id,
          ratingAvg: 4.9,
          ratingCount: 22
        },
        {
          name: 'Desi Organic Toor Dal (Arhar Dal - Unpolished)',
          category: 'Dal',
          pricePerKg: 165,
          stockKg: 300,
          image: 'https://images.unsplash.com/photo-1599307767316-776533bb941c?w=600&auto=format&fit=crop&q=80',
          description: 'Sun-dried, machine-free stone split yellow pigeon peas (Toor dal). Rich in plant protein and free from mineral oil polishes.',
          farmer: farmer1._id,
          ratingAvg: 4.7,
          ratingCount: 9
        },
        {
          name: 'Organic Foxtail Millet (Kangni / Navane)',
          category: 'Millets',
          pricePerKg: 95,
          stockKg: 250,
          image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80',
          description: 'High-fiber, low-glycemic ancient super grain grown in Karnataka rainfed fields. Ideal for diabetes management and gluten-free diets.',
          farmer: farmer3._id,
          ratingAvg: 4.6,
          ratingCount: 11
        },
        {
          name: 'Native Yellow Moong Dal (Split)',
          category: 'Dal',
          pricePerKg: 140,
          stockKg: 380,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
          description: 'Light on digestion, quick cooking yellow split moong dal directly harvested from MP fields. Great for khichdi and healthy dals.',
          farmer: farmer1._id,
          ratingAvg: 4.5,
          ratingCount: 7
        },
        {
          name: 'Pure Organic Black Mustard Seeds (Sarson)',
          category: 'Oilseeds',
          pricePerKg: 120,
          stockKg: 180,
          image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',
          description: 'Pungent, high oil content black mustard seeds for tempering Indian dishes and cold-press oil extraction.',
          farmer: farmer2._id,
          ratingAvg: 4.8,
          ratingCount: 5
        },
        {
          name: 'Whole Pearl Millet Grains (Desi Bajra)',
          category: 'Millets',
          pricePerKg: 42,
          stockKg: 500,
          image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80',
          description: 'Wholesome winter grain rich in iron, calcium, and magnesium. Ideal for nutritious Bajra rotis and porridge.',
          farmer: farmer3._id,
          ratingAvg: 4.6,
          ratingCount: 8
        },
        {
          name: 'Unpolished Brown Sona Masoori Rice',
          category: 'Rice',
          pricePerKg: 75,
          stockKg: 400,
          image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
          description: 'Nutritious brown rice with bran intact, harvested along the fertile Kaveri river basin in Mandya.',
          farmer: farmer3._id,
          ratingAvg: 4.7,
          ratingCount: 12
        }
      ];

      const createdProducts = await Product.insertMany(sampleProducts);
      console.log(`[Seed] Inserted ${createdProducts.length} sample grain products.`);

      // Create a sample delivered order with feedback
      const sampleOrder = await Order.create({
        orderNumber: 'KD-20260830-1001',
        customer: customer1._id,
        farmer: farmer1._id,
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            category: createdProducts[0].category,
            pricePerKg: createdProducts[0].pricePerKg,
            quantityKg: 10,
            subtotal: 480
          }
        ],
        totalAmount: 480,
        deliveryAddress: customer1.address,
        deliveryPhone: customer1.phone,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'completed',
        orderStatus: 'delivered',
        hasFeedback: true,
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Order placed by customer' },
          { status: 'accepted', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Farmer accepted order' },
          { status: 'packed', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Grains packed in jute bags' },
          { status: 'shipped', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Dispatched via rural courier' },
          { status: 'delivered', timestamp: new Date(), note: 'Delivered directly to doorstep' }
        ]
      });

      await Payment.create({
        order: sampleOrder._id,
        customer: customer1._id,
        amount: 480,
        method: 'Cash on Delivery',
        status: 'completed'
      });

      await Feedback.create({
        order: sampleOrder._id,
        product: createdProducts[0]._id,
        customer: customer1._id,
        farmer: farmer1._id,
        rating: 5,
        comment: 'Outstanding quality Sharbati wheat! Rotis turned out so soft and sweet. So glad to buy directly from farmer Ramesh ji!'
      });

      console.log('[Seed] Created sample delivered order and customer feedback.');
    }

    console.log('\n=============================================');
    console.log(' SEEDING COMPLETE');
    console.log('=============================================');
    console.log('Demo Logins:');
    console.log(' Admin:    admin@kisandirect.com    / AdminPassword123');
    console.log(' Farmer:   ramesh.farmer@kisandirect.com / Kisan@123');
    console.log(' Customer: priya.customer@kisandirect.com / Kisan@123');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
