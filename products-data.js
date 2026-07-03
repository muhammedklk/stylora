const productsData = [
    {
        id: 1,
        title: "Classic Wool Coat",
        category: "outerwear",
        price: "₹12,499",
        image: "assets/find-section-img-1.png",
        tags: ["New Arrival", "Outerwear"],
        description: "A premium wool coat crafted with tailored lines and absolute precision. Provides warmth, timeless structure, and ultimate cinematic style for any cold-weather wardrobe."
    },
    {
        id: 2,
        title: "Casual Denim Jacket",
        category: "outerwear",
        price: "₹4,999",
        image: "assets/find-section-img-2.png",
        tags: ["Clothing", "Outerwear"],
        description: "Classic rugged denim jacket featuring button closures, chest pockets, and custom fading. Constructed from durable heavy cotton denim designed to age beautifully."
    },
    {
        id: 3,
        title: "Linen Summer Shirt",
        category: "shirts",
        price: "₹2,499",
        image: "assets/find-section-img-3.png",
        tags: ["Clothing", "Shirts"],
        description: "Lightweight and breathable linen shirt featuring a relaxed collar and button-down front. Perfect for summer days and warm evening events."
    },
    {
        id: 4,
        title: "Ribbed Knit Sweater",
        category: "clothing",
        price: "₹3,799",
        image: "assets/find-section-img-4.png",
        tags: ["Clothing", "New Arrival"],
        description: "A cozy ribbed sweater crafted from high-quality spun yarn. Features dynamic color tones and elasticated fit lines."
    },
    {
        id: 5,
        title: "Minimalist Leather Sneakers",
        category: "shoes",
        price: "₹6,499",
        image: "assets/find-section-img-5.png",
        tags: ["Shoes", "New Arrival"],
        description: "Clean leather sneakers featuring cushioned footbeds and vulcanized rubber soles. The absolute cornerstone of minimalist styling."
    },
    {
        id: 6,
        title: "Athletic Training Joggers",
        category: "activewear",
        price: "₹2,999",
        image: "assets/find-section-img-6.png",
        tags: ["Clothing", "Activewear"],
        description: "Flexible, sweat-wicking joggers built for motion. Features deep zipper pockets, elastic waistbands, and comfortable stretch seams."
    },
    {
        id: 7,
        title: "Tailored Smart Trousers",
        category: "pants",
        price: "₹3,999",
        image: "assets/find-section-img-7.png",
        tags: ["Clothing", "Pants"],
        description: "Editorial smart trousers with structural pleats and tapered fits. Combines high-end formal tailoring with everyday stretch comfort."
    },
    {
        id: 8,
        title: "Comfort Casual Shorts",
        category: "shorts",
        price: "₹1,999",
        image: "assets/find-section-img-8.png",
        tags: ["Clothing", "Shorts"],
        description: "Relaxed cotton shorts featuring drawcord details and functional pockets. Designed for weekend outings and ultimate leisure."
    },
    {
        id: 9,
        title: "Longines Premium Watch",
        category: "watches",
        price: "₹24,999",
        image: "assets/find-section-img-5.png",
        tags: ["Accessories", "Watches", "New Arrival"],
        description: "An elegant timekeeper featuring a detailed moonphase complications layout, stainless steel frame, and genuine leather strap."
    },
    {
        id: 10,
        title: "Classic Leather Briefcase",
        category: "bags",
        price: "₹8,999",
        image: "assets/find-section-img-1.png",
        tags: ["Accessories", "Bags"],
        description: "Timeless leather briefcase with spacious document sleeves, metallic lock systems, and robust carry straps."
    },
    {
        id: 11,
        title: "Aviator Black Sunglasses",
        category: "sunglasses",
        price: "₹3,499",
        image: "assets/find-section-img-3.png",
        tags: ["Accessories", "Sunglasses", "New Arrival"],
        description: "Dark polarized sunglasses constructed with a lightweight metallic frame. Delivers 100% UV protection and high-end elegance."
    },
    {
        id: 12,
        title: "Minimalist Suede Wallet",
        category: "belts-wallets",
        price: "₹1,999",
        image: "assets/find-section-img-7.png",
        tags: ["Accessories", "Belts & Wallets"],
        description: "Slim suede leather wallet with RFID blocking slots. Crafted for sleek, front-pocket convenience."
    },
    {
        id: 13,
        title: "Washed Cotton Baseball Cap",
        category: "hats-caps",
        price: "₹1,299",
        image: "assets/find-section-img-2.png",
        tags: ["Accessories", "Hats & Caps"],
        description: "Relaxed fit washed cotton cap with an adjustable brass buckle. A subtle, high-quality athletic accent."
    },
    {
        id: 14,
        title: "Silver Anchor Chain Bracelet",
        category: "jewelry",
        price: "₹2,799",
        image: "assets/find-section-img-4.png",
        tags: ["Accessories", "Jewelry"],
        description: "Solid 925 sterling silver anchor chain bracelet. Adds a touch of refined edge to any modern wrist."
    },
    {
        id: 15,
        title: "Organic Cotton Socks Pack",
        category: "socks",
        price: "₹899",
        image: "assets/find-section-img-6.png",
        tags: ["Accessories", "Socks"],
        description: "Three-pack of ribbed socks spun from certified organic cotton. Features reinforced heels and comfortable arch compression."
    },
    {
        id: 16,
        title: "Essential Hoodie",
        category: "outerwear",
        price: "₹899",
        image: "assets/essential-Hoodie-(pr-1).png",
        tags: ["Bestseller", "Clothing", "Outerwear"],
        description: "An absolute classic. The Essential Hoodie is made from ultra-soft brushed fleece with double-lined hood designs."
    },
    {
        id: 17,
        title: "Sand Oversize T-Shirt",
        category: "shirts",
        price: "₹498",
        image: "assets/sand-over(pr-1).png",
        tags: ["Bestseller", "Clothing", "Shirts"],
        description: "Heavy cotton t-shirt with drop-shoulder tailoring and a tight crew neckline. Built to hold its shape over time."
    },
    {
        id: 18,
        title: "Ocean Hoodie",
        category: "outerwear",
        price: "₹489",
        image: "assets/occian-h00die(pr-1).png",
        tags: ["Bestseller", "Clothing", "Outerwear"],
        description: "Spun in deep ocean blue, this heavyweight hoodie features dynamic fits, robust cuffs, and ultimate casual comfort."
    },
    {
        id: 19,
        title: "Core Utility Pants",
        category: "pants",
        price: "₹779",
        image: "assets/core-utlity-pants(pr-1).png",
        tags: ["Bestseller", "Clothing", "Pants"],
        description: "Everyday utility trousers featuring elastic drawcords, reinforced knees, and multi-functional cargo pocket bays."
    },
    {
        id: 20,
        title: "Longines Moonphase",
        category: "watches",
        price: "₹2,699",
        image: "assets/longines-moonpnase(pr-1).png",
        tags: ["Bestseller", "Accessories", "Watches"],
        description: "Premium leather wrist watch featuring detailed star charts, gold bezel accents, and moonphase calendars."
    }
];
