const Product = require('../models/product');
const Review = require('../models/review');

exports.getProducts = async (req, res) => {
    try {
        const { category, search, tag, sort } = req.query;
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        if (tag) {
            query.tags = tag;
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        let sortQuery = { createdAt: -1 }; // default: newest
        if (sort === 'price-asc') {
            sortQuery = { price: 1 };
        } else if (sort === 'price-desc') {
            sortQuery = { price: -1 };
        } else if (sort === 'rating') {
            sortQuery = { rating: -1 };
        }
        
        const products = await Product.find(query).sort(sortQuery);
        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });
        return res.json({ product, reviews });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching product details', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { title, category, price, description, tags, inventoryCount, brand, videoUrl, originalPrice, sizes, colors } = req.body;
        
        // Check files object populated by upload.fields
        let imageUrl = '';
        if (req.files && req.files.image && req.files.image.length > 0) {
            imageUrl = 'uploads/' + req.files.image[0].filename;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        } else {
            return res.status(400).json({ message: 'Product image is required' });
        }

        let finalVideoUrl = '';
        if (req.files && req.files.video && req.files.video.length > 0) {
            finalVideoUrl = 'uploads/' + req.files.video[0].filename;
        } else if (req.body.videoUrl) {
            finalVideoUrl = req.body.videoUrl;
        } else {
            finalVideoUrl = videoUrl || '';
        }
        
        const tagList = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];

        let sizeList = [];
        if (sizes) {
            try {
                sizeList = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
            } catch (e) {
                sizeList = String(sizes).split(',').map(s => s.trim());
            }
        } else {
            sizeList = ['S', 'M', 'L', 'XL'];
        }

        let colorList = [];
        if (colors) {
            try {
                colorList = Array.isArray(colors) ? colors : JSON.parse(colors);
            } catch (e) {
                colorList = String(colors).split(',').map(c => ({ name: c.trim(), hex: '#7a7a7a' }));
            }
        } else {
            colorList = [
                { name: 'Black', hex: '#1a1a1a' },
                { name: 'Gray', hex: '#7a7a7a' },
                { name: 'White', hex: '#ffffff' }
            ];
        }
        
        const product = await Product.create({
            title,
            category,
            price: Number(price),
            description,
            image: imageUrl,
            tags: tagList,
            inventoryCount: Number(inventoryCount || 50),
            brand: brand || 'STYLORA',
            videoUrl: finalVideoUrl,
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            sizes: sizeList,
            colors: colorList
        });
        
        return res.status(201).json(product);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { title, category, price, description, tags, inventoryCount, brand, videoUrl, originalPrice, sizes, colors } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (title) product.title = title;
        if (category) product.category = category;
        if (price) product.price = Number(price);
        if (description) product.description = description;
        if (inventoryCount !== undefined) product.inventoryCount = Number(inventoryCount);
        if (brand !== undefined) product.brand = brand;
        if (originalPrice !== undefined) product.originalPrice = originalPrice ? Number(originalPrice) : undefined;
        
        if (tags) {
            product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        }

        if (sizes !== undefined) {
            try {
                product.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
            } catch (e) {
                product.sizes = String(sizes).split(',').map(s => s.trim());
            }
        }

        if (colors !== undefined) {
            try {
                product.colors = Array.isArray(colors) ? colors : JSON.parse(colors);
            } catch (e) {
                product.colors = String(colors).split(',').map(c => ({ name: c.trim(), hex: '#7a7a7a' }));
            }
        }
        
        // Handle files object populated by upload.fields
        if (req.files && req.files.image && req.files.image.length > 0) {
            product.image = 'uploads/' + req.files.image[0].filename;
        } else if (req.body.image) {
            product.image = req.body.image;
        }

        if (req.files && req.files.video && req.files.video.length > 0) {
            product.videoUrl = 'uploads/' + req.files.video[0].filename;
        } else if (videoUrl !== undefined) {
            product.videoUrl = videoUrl;
        }
        
        await product.save();
        return res.json(product);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await Product.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { rating, comment, userName } = req.body;
        const productId = req.params.id;
        
        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const review = await Review.create({
            productId,
            userId: req.user.id,
            userName: userName || 'Anonymous',
            rating: Number(rating),
            comment
        });
        
        // Update product reviews count and rating
        const allReviews = await Review.find({ productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        product.rating = Math.round(avgRating * 10) / 10;
        product.reviewsCount = allReviews.length;
        await product.save();
        
        return res.status(201).json(review);
    } catch (error) {
        return res.status(500).json({ message: 'Error adding review', error: error.message });
    }
};
