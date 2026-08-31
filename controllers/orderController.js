const Order = require('../models/Order');
const OrderDetails = require('../models/OrderDetails');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

/**
 * Helper to generate human-readable order number
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `KD-${dateStr}-${randomStr}`;
};

/**
 * @desc   Create an order from customer's current cart
 * @route  POST /api/orders
 * @access Private (Customer)
 */
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, deliveryPhone, paymentMethod = 'Cash on Delivery' } = req.body;

    if (!deliveryAddress || !deliveryPhone) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address and contact phone number are required.'
      });
    }

    const cart = await Cart.findOne({ customer: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add grains to checkout.'
      });
    }

    // Verify stock and group items by farmer
    const itemsByFarmer = {};

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product) continue;

      // Check current live stock in DB
      const liveProduct = await Product.findById(product._id);
      if (!liveProduct || liveProduct.stockKg < cartItem.quantityKg) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${liveProduct ? liveProduct.stockKg : 0} kg remaining.`
        });
      }

      const farmerIdStr = product.farmer.toString();
      if (!itemsByFarmer[farmerIdStr]) {
        itemsByFarmer[farmerIdStr] = [];
      }

      const subtotal = liveProduct.pricePerKg * cartItem.quantityKg;
      itemsByFarmer[farmerIdStr].push({
        product: liveProduct._id,
        name: liveProduct.name,
        category: liveProduct.category,
        pricePerKg: liveProduct.pricePerKg,
        quantityKg: cartItem.quantityKg,
        subtotal
      });
    }

    const createdOrders = [];

    // Process each farmer's order bundle
    for (const farmerId of Object.keys(itemsByFarmer)) {
      const items = itemsByFarmer[farmerId];
      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
      const orderNumber = generateOrderNumber();

      // Deduct stock for all items
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockKg: -item.quantityKg }
        });
      }

      // Create Order
      const initialPaymentStatus = (paymentMethod !== 'Cash on Delivery') ? 'completed' : 'pending';

      const order = await Order.create({
        orderNumber,
        customer: req.user.id,
        farmer: farmerId,
        items,
        totalAmount,
        deliveryAddress: deliveryAddress.trim(),
        deliveryPhone: deliveryPhone.trim(),
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          note: `Order placed by customer via ${paymentMethod} (${initialPaymentStatus})`
        }]
      });

      // Create line item details in OrderDetails
      for (const item of items) {
        await OrderDetails.create({
          order: order._id,
          product: item.product,
          customer: req.user.id,
          farmer: farmerId,
          productName: item.name,
          category: item.category,
          pricePerKg: item.pricePerKg,
          quantityKg: item.quantityKg,
          subtotal: item.subtotal
        });
      }

      // Create Payment entry
      await Payment.create({
        order: order._id,
        customer: req.user.id,
        amount: totalAmount,
        method: paymentMethod,
        status: initialPaymentStatus,
        transactionDate: new Date()
      });

      createdOrders.push(order);
    }

    // Clear customer's cart
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully directly with the farmer(s)!',
      orders: createdOrders
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error placing order.'
    });
  }
};

/**
 * @desc   Get current customer's order history
 * @route  GET /api/orders/my-orders
 * @access Private (Customer)
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('farmer', 'name phone location email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your orders.'
    });
  }
};

/**
 * @desc   Get single order by ID
 * @route  GET /api/orders/:id
 * @access Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmer', 'name phone location email')
      .populate('customer', 'name phone address email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Verify authorized party (customer, farmer, or admin)
    const isCustomer = req.user.role === 'customer' && order.customer._id.toString() === req.user.id;
    const isFarmer = req.user.role === 'farmer' && order.farmer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this order.'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving order details.'
    });
  }
};

/**
 * @desc   Leave Feedback & Rating for a delivered order
 * @route  POST /api/orders/:id/feedback
 * @access Private (Customer)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const orderId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating (1-5) and feedback comment are required.'
      });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.'
      });
    }

    const order = await Order.findOne({ _id: orderId, customer: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed/delivered orders.'
      });
    }

    // Determine target product
    let targetProductId = productId;
    if (!targetProductId && order.items.length > 0) {
      targetProductId = order.items[0].product;
    }

    // Check if feedback already submitted for this order and product
    const existingFeedback = await Feedback.findOne({
      order: order._id,
      customer: req.user.id
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this order.'
      });
    }

    // Create Feedback record
    const feedback = await Feedback.create({
      order: order._id,
      product: targetProductId,
      customer: req.user.id,
      farmer: order.farmer,
      rating: ratingNum,
      comment: comment.trim()
    });

    order.hasFeedback = true;
    await order.save();

    // Recalculate average rating for the product
    if (targetProductId) {
      const productFeedbacks = await Feedback.find({ product: targetProductId });
      const totalScore = productFeedbacks.reduce((sum, f) => sum + f.rating, 0);
      const avg = Number((totalScore / productFeedbacks.length).toFixed(1));

      await Product.findByIdAndUpdate(targetProductId, {
        ratingAvg: avg,
        ratingCount: productFeedbacks.length
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback and rating have been recorded.',
      feedback
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting feedback.'
    });
  }
};
