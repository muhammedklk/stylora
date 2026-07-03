require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));

// Root endpoint
app.get('/', (req, res) => {
    res.send('STYLORA REST API is running...');
});

// Seed Data helper
const seedDatabase = async () => {
    try {
        const Product = require('./models/product');
        const Coupon = require('./models/coupon');
        const User = require('./models/user');
        const bcrypt = require('bcryptjs');

        // Check and seed Admin user if not exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Admin User',
                email: 'admin@styleora.in',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('seeded default admin: admin@styleora.in / admin123');
        }

        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                {
                    title: "Classic Wool Coat",
                    category: "outerwear",
                    price: 12499,
                    image: "assets/find-section-img-1.png",
                    tags: ["New Arrival", "Outerwear"],
                    description: "A premium wool coat crafted with tailored lines and absolute precision. Provides warmth, timeless structure, and ultimate cinematic style for any cold-weather wardrobe.",
                    inventoryCount: 50
                },
                {
                    title: "Casual Denim Jacket",
                    category: "outerwear",
                    price: 4999,
                    image: "assets/find-section-img-2.png",
                    tags: ["Clothing", "Outerwear"],
                    description: "Classic rugged denim jacket featuring button closures, chest pockets, and custom fading. Constructed from durable heavy cotton denim designed to age beautifully.",
                    inventoryCount: 50
                },
                {
                    title: "Linen Summer Shirt",
                    category: "shirts",
                    price: 2499,
                    image: "assets/find-section-img-3.png",
                    tags: ["Clothing", "Shirts"],
                    description: "Lightweight and breathable linen shirt featuring a relaxed collar and button-down front. Perfect for summer days and warm evening events.",
                    inventoryCount: 50
                },
                {
                    title: "Ribbed Knit Sweater",
                    category: "clothing",
                    price: 3799,
                    image: "assets/find-section-img-4.png",
                    tags: ["Clothing", "New Arrival"],
                    description: "A cozy ribbed sweater crafted from high-quality spun yarn. Features dynamic color tones and elasticated fit lines.",
                    inventoryCount: 50
                },
                {
                    title: "Minimalist Leather Sneakers",
                    category: "shoes",
                    price: 6499,
                    image: "assets/find-section-img-5.png",
                    tags: ["Shoes", "New Arrival"],
                    description: "Clean leather sneakers featuring cushioned footbeds and vulcanized rubber soles. The absolute cornerstone of minimalist styling.",
                    inventoryCount: 50
                },
                {
                    title: "Athletic Training Joggers",
                    category: "activewear",
                    price: 2999,
                    image: "assets/find-section-img-6.png",
                    tags: ["Clothing", "Activewear"],
                    description: "Flexible, sweat-wicking joggers built for motion. Features deep zipper pockets, elastic waistbands, and comfortable stretch seams.",
                    inventoryCount: 50
                },
                {
                    title: "Tailored Smart Trousers",
                    category: "pants",
                    price: 3999,
                    image: "assets/find-section-img-7.png",
                    tags: ["Clothing", "Pants"],
                    description: "Editorial smart trousers with structural pleats and tapered fits. Combines high-end formal tailoring with everyday stretch comfort.",
                    inventoryCount: 50
                },
                {
                    title: "Comfort Casual Shorts",
                    category: "shorts",
                    price: 1999,
                    image: "assets/find-section-img-8.png",
                    tags: ["Clothing", "Shorts"],
                    description: "Relaxed cotton shorts featuring drawcord details and functional pockets. Designed for weekend outings and ultimate leisure.",
                    inventoryCount: 50
                },
                {
                    title: "Longines Premium Watch",
                    category: "watches",
                    price: 24999,
                    image: "assets/find-section-img-5.png",
                    tags: ["Accessories", "Watches", "New Arrival"],
                    description: "An elegant timekeeper featuring a detailed moonphase complications layout, stainless steel frame, and genuine leather strap.",
                    inventoryCount: 50
                },
                {
                    title: "Classic Leather Briefcase",
                    category: "bags",
                    price: 8999,
                    image: "assets/find-section-img-1.png",
                    tags: ["Accessories", "Bags"],
                    description: "Timeless leather briefcase with spacious document sleeves, metallic lock systems, and robust carry straps.",
                    inventoryCount: 50
                },
                {
                    title: "Aviator Black Sunglasses",
                    category: "sunglasses",
                    price: 3499,
                    image: "assets/find-section-img-3.png",
                    tags: ["Accessories", "Sunglasses", "New Arrival"],
                    description: "Dark polarized sunglasses constructed with a lightweight metallic frame. Delivers 100% UV protection and high-end elegance.",
                    inventoryCount: 50
                },
                {
                    title: "Minimalist Suede Wallet",
                    category: "belts-wallets",
                    price: 1999,
                    image: "assets/find-section-img-7.png",
                    tags: ["Accessories", "Belts & Wallets"],
                    description: "Slim suede leather wallet with RFID blocking slots. Crafted for sleek, front-pocket convenience.",
                    inventoryCount: 50
                },
                {
                    title: "Washed Cotton Baseball Cap",
                    category: "hats-caps",
                    price: 1299,
                    image: "assets/find-section-img-2.png",
                    tags: ["Accessories", "Hats & Caps"],
                    description: "Relaxed fit washed cotton cap with an adjustable brass buckle. A subtle, high-quality athletic accent.",
                    inventoryCount: 50
                },
                {
                    title: "Silver Anchor Chain Bracelet",
                    category: "jewelry",
                    price: 2799,
                    image: "assets/find-section-img-4.png",
                    tags: ["Accessories", "Jewelry"],
                    description: "Solid 925 sterling silver anchor chain bracelet. Adds a touch of refined edge to any modern wrist.",
                    inventoryCount: 50
                },
                {
                    title: "Organic Cotton Socks Pack",
                    category: "socks",
                    price: 899,
                    image: "assets/find-section-img-6.png",
                    tags: ["Accessories", "Socks"],
                    description: "Three-pack of ribbed socks spun from certified organic cotton. Features reinforced heels and comfortable arch compression.",
                    inventoryCount: 50
                },
                {
                    title: "Essential Hoodie",
                    category: "outerwear",
                    price: 899,
                    image: "assets/essential-Hoodie-(pr-1).png",
                    tags: ["Bestseller", "Clothing", "Outerwear"],
                    description: "An absolute classic. The Essential Hoodie is made from ultra-soft brushed fleece with double-lined hood designs.",
                    inventoryCount: 50
                },
                {
                    title: "Sand Oversize T-Shirt",
                    category: "shirts",
                    price: 498,
                    image: "assets/sand-over(pr-1).png",
                    tags: ["Bestseller", "Clothing", "Shirts"],
                    description: "Heavy cotton t-shirt with drop-shoulder tailoring and a tight crew neckline. Built to hold its shape over time.",
                    inventoryCount: 50
                },
                {
                    title: "Ocean Hoodie",
                    category: "outerwear",
                    price: 489,
                    image: "assets/occian-h00die(pr-1).png",
                    tags: ["Bestseller", "Clothing", "Outerwear"],
                    description: "Spun in deep ocean blue, this heavyweight hoodie features dynamic fits, robust cuffs, and ultimate casual comfort.",
                    inventoryCount: 50
                },
                {
                    title: "Core Utility Pants",
                    category: "pants",
                    price: 779,
                    image: "assets/core-utlity-pants(pr-1).png",
                    tags: ["Bestseller", "Clothing", "Pants"],
                    description: "Everyday utility trousers featuring elastic drawcords, reinforced knees, and multi-functional cargo pocket bays.",
                    inventoryCount: 50
                },
                {
                    title: "Longines Moonphase",
                    category: "watches",
                    price: 2699,
                    image: "assets/longines-moonpnase(pr-1).png",
                    tags: ["Bestseller", "Accessories", "Watches"],
                    description: "Premium leather wrist watch featuring detailed star charts, gold bezel accents, and moonphase calendars.",
                    inventoryCount: 50
                }
            ];
            await Product.insertMany(initialProducts);
            console.log('Seeded database with initial products list');
        }

        const couponCount = await Coupon.countDocuments();
        if (couponCount === 0) {
            await Coupon.create([
                {
                    code: 'WELCOME10',
                    discountType: 'percentage',
                    discountValue: 10,
                    minPurchase: 0,
                    expiryDate: new Date('2027-12-31')
                },
                {
                    code: 'STYLORA20',
                    discountType: 'percentage',
                    discountValue: 20,
                    minPurchase: 1999,
                    expiryDate: new Date('2027-12-31')
                }
            ]);
            console.log('Seeded default coupons: WELCOME10, STYLORA20');
        }
    } catch (e) {
        console.error('Seeding database error: ', e);
    }
};

// Database Connection
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('CRITICAL ERROR: MONGO_URI environment variable is missing.');
        console.error('The application requires a valid MONGO_URI to connect to the database.');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB database...');
        await mongoose.connect(mongoUri);
        console.log('MongoDB connection successful');
        
        await seedDatabase();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('CRITICAL ERROR: MongoDB database connection failed:');
        console.error(err);
        process.exit(1);
    }
};

connectDB();
