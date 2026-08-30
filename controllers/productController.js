const Product = require('../models/Product');
const Feedback = require('../models/Feedback');

/**
 * @desc   Get all products with filtering, search, and sorting
 * @route  GET /api/products
 * @access Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    let query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Keyword search (name or description)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerKg = {};
      if (minPrice) query.pricePerKg.$gte = Number(minPrice);
      if (maxPrice) query.pricePerKg.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === 'price-asc') {
      sortOption = { pricePerKg: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { pricePerKg: -1 };
    } else if (sort === 'rating') {
      sortOption = { ratingAvg: -1, ratingCount: -1 };
    } else if (sort === 'stock') {
      sortOption = { stockKg: -1 };
    }

    const products = await Product.find(query)
      .populate('farmer', 'name location phone email')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching products.'
    });
  }
};

/**
 * @desc   Get single product details with reviews & farmer info
 * @route  GET /api/products/:id
 * @access Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name location phone email createdAt');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Fetch feedbacks/reviews for this product
    const feedbacks = await Feedback.find({ product: product._id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      product,
      reviews: feedbacks
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching product details.'
    });
  }
};

/**
 * @desc   Get list of categories with product counts
 * @route  GET /api/products/meta/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = ['Wheat', 'Rice', 'Dal', 'Millets', 'Pulses', 'Oilseeds', 'Spices', 'Barley', 'Corn', 'Oats'];
    
    // Aggregation to get counts per category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(item => {
      countMap[item._id] = item.count;
    });

    const categoryList = categories.map(cat => ({
      name: cat,
      count: countMap[cat] || 0
    }));

    return res.status(200).json({
      success: true,
      categories: categoryList
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching categories.'
    });
  }
};
