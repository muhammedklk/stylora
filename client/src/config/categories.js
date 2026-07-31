export const SUB_CATEGORIES = {
    't-shirts': ['Oversized', 'Polo', 'Printed', 'Striped', 'Plain Solid', 'V-Neck', 'Full Sleeve', 'Graphic'],
    shirts: ['Checked', 'Plain', 'Formal', 'Printed'],
    pants: ['Formal', 'Baggy Jeans', 'Straight Fit Jeans', 'Cotton Pants', 'Bootcut', 'Track Pants'],
    shoes: ['Sneakers', 'Formal Shoes', 'Loafers', 'Boots', 'Sports & Running'],
    accessories: ['Bags & Backpacks', 'Sunglasses', 'Belts & Wallets', 'Hats & Caps', 'Jewelry', 'Socks'],
    watches: ['Analog Watches', 'Digital Watches', 'Smartwatches', 'Luxury Watches', 'Chronograph'],
    outerwear: ['Coats', 'Jackets', 'Hoodies', 'Sweaters'],
    activewear: ['Gym Tops', 'Joggers', 'Sports Shorts', 'Compression Wear'],
    clothing: ['Casual', 'Formal', 'Ethnic', 'Streetwear']
};

export const CATEGORIES_LIST = [
    { value: 't-shirts', label: 'T-Shirts' },
    { value: 'shirts', label: 'Shirts' },
    { value: 'pants', label: 'Pants & Trousers' },
    { value: 'shoes', label: 'Shoes & Footwear' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'watches', label: 'Watches' },
    { value: 'outerwear', label: 'Coats & Jackets' },
    { value: 'activewear', label: 'Activewear' },
    { value: 'clothing', label: 'General Clothing' }
];

export const getSubCategories = (catName) => {
    if (!catName) return ['General'];
    const cleanCat = String(catName).toLowerCase().trim();
    if (SUB_CATEGORIES[cleanCat]) return SUB_CATEGORIES[cleanCat];
    
    if (cleanCat.includes('outerwear') || cleanCat.includes('coat') || cleanCat.includes('jacket')) return SUB_CATEGORIES['outerwear'];
    if (cleanCat.includes('t-shirt') || cleanCat.includes('tshirt')) return SUB_CATEGORIES['t-shirts'];
    if (cleanCat.includes('shirt')) return SUB_CATEGORIES['shirts'];
    if (cleanCat.includes('pant') || cleanCat.includes('trouser') || cleanCat.includes('jean')) return SUB_CATEGORIES['pants'];
    if (cleanCat.includes('shoe') || cleanCat.includes('footwear') || cleanCat.includes('sneaker')) return SUB_CATEGORIES['shoes'];
    if (cleanCat.includes('watch')) return SUB_CATEGORIES['watches'];
    if (cleanCat.includes('accessory') || cleanCat.includes('accessories')) return SUB_CATEGORIES['accessories'];
    if (cleanCat.includes('active')) return SUB_CATEGORIES['activewear'];
    if (cleanCat.includes('clothing')) return SUB_CATEGORIES['clothing'];

    return ['General'];
};

export const CATEGORY_SIZE_PRESETS = {
    't-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    'shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    'outerwear': ['S', 'M', 'L', 'XL', 'XXL'],
    'activewear': ['S', 'M', 'L', 'XL', 'XXL'],
    'clothing': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'pants': ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
    'shoes': ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'],
    'watches': ['One Size', 'Free Size', 'Adjustable'],
    'accessories': ['One Size', 'Free Size', 'Small', 'Medium', 'Large']
};
