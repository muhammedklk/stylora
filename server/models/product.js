const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    description: {
        type: String,
        required: true
    },
    inventoryCount: {
        type: Number,
        default: 50
    },
    brand: {
        type: String,
        default: 'STYLORA',
        trim: true
    },
    videoUrl: {
        type: String,
        default: '',
        trim: true
    },
    sizes: [{
        type: String
    }],
    colors: [{
        name: { type: String },
        hex: { type: String }
    }],
    originalPrice: {
        type: Number
    },
    rating: {
        type: Number,
        default: 5
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
