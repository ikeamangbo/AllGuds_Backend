const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sellerId = new mongoose.Types.ObjectId();

const sampleProducts = [
  {
    name: 'Apple MacBook Pro 16"',
    desc: '2023 M2 Max Chip with 12‑Core CPU and 38‑Core GPU',
    type: 'Electronics',
    price: 3499.99,
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 25,
    seller: sellerId,
    available: true
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    desc: 'Industry-leading noise cancellation with AI processor',
    type: 'Electronics',
    price: 399.99,
    img: 'https://images.unsplash.com/photo-1641898378375-4651abdd9a99?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 40,
    seller: sellerId,
    available: true
  },
  {
    name: 'Men\'s Premium Cotton Shirt',
    desc: 'Slim-fit dress shirt with Italian collar',
    type: 'Fashion',
    price: 89.95,
    img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 60,
    seller: sellerId,
    available: true
  },
  {
    name: 'Women\'s Running Shoes',
    desc: 'Lightweight mesh sneakers with air cushion technology',
    type: 'Fashion',
    price: 129.99,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 45,
    seller: sellerId,
    available: true
  },
  {
    name: 'Professional Espresso Machine',
    desc: '15-bar pressure system with milk frother',
    type: 'Home Appliances',
    price: 599.00,
    img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 15,
    seller: sellerId,
    available: true
  },
  {
    name: 'High-Speed Blender',
    desc: '2000W professional-grade blender with 8 presets',
    type: 'Home Appliances',
    price: 299.95,
    img: 'https://images.unsplash.com/photo-1578985545064-069b019d3ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 30,
    seller: sellerId,
    available: true
  },
  {
    name: 'Ergonomic Office Chair',
    desc: 'Adjustable lumbar support with breathable mesh',
    type: 'Furniture',
    price: 459.99,
    img: 'https://images.unsplash.com/photo-1505797149-43a006d6a88e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 20,
    seller: sellerId,
    available: true
  },
  {
    name: 'Modern Desk Lamp',
    desc: 'LED touch-controlled lamp with dimmable settings',
    type: 'Home Decor',
    price: 79.99,
    img: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 50,
    seller: sellerId,
    available: true
  },
  {
    name: 'Wireless Security Camera',
    desc: '4K resolution with night vision and motion detection',
    type: 'Smart Home',
    price: 199.00,
    img: 'https://images.unsplash.com/photo-1591940745155-3c7d1e5b034d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 35,
    seller: sellerId,
    available: true
  },
  {
    name: 'Electric Toothbrush',
    desc: 'Sonic technology with 6 cleaning modes',
    type: 'Personal Care',
    price: 129.95,
    img: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 70,
    seller: sellerId,
    available: true
  },
  {
    name: 'Premium Yoga Mat',
    desc: 'Eco-friendly natural rubber with alignment markers',
    type: 'Fitness',
    price: 69.99,
    img: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 55,
    seller: sellerId,
    available: true
  },
  {
    name: 'Designer Backpack',
    desc: 'Water-resistant laptop backpack with USB charging port',
    type: 'Fashion',
    price: 159.00,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 40, 
    seller: sellerId,
    available: true
  },
  {
    name: 'Smart Fitness Watch',
    desc: 'Health monitoring with SpO2 and ECG tracking',
    type: 'Wearables',
    price: 299.99,
    img: 'https://images.unsplash.com/photo-1585123388860-6d52a6b37669?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 30,
    seller: sellerId,
    available: true
  },
  {
    name: 'Stainless Steel Cookware Set',
    desc: '10-piece professional kitchen cookware set',
    type: 'Kitchenware',
    price: 399.00,
    img: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 18,
    seller: sellerId,
    available: true
  },
  {
    name: 'Bestseller Novel Collection',
    desc: 'Box set of 10 contemporary fiction novels',
    type: 'Books',
    price: 149.99,
    img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 25,
    seller: sellerId,
    available: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const products = await Product.insertMany(sampleProducts);
    console.log('Added sample products:');
    products.forEach(product => {
      console.log(`- ${product.name} (ID: ${product._id}, Seller: ${product.seller})`);
    });

    console.log(`\nDatabase seeded successfully with ${products.length} products`);
    console.log(`Created seller ID: ${sellerId}`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();