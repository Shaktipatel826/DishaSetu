const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Farmer = require('../models/Farmer');

/**
 * @desc   Get all products listed by the logged-in farmer
 * @route  GET /api/farmers/products
 * @access Private (Farmer)
 */
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Farmer Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching your products.'
    });
  }
};

/**
 * @desc   Add a new grain product
 * @route  POST /api/farmers/products
 * @access Private (Farmer)
 */
exports.addProduct = async (req, res) => {
  try {
    const { name, category, pricePerKg, stockKg, image, description } = req.body;

    if (!name || !category || pricePerKg === undefined || stockKg === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, price per kg, and stock quantity are required.'
      });
    }

    if (Number(pricePerKg) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per kg must be greater than 0.'
      });
    }

    if (Number(stockKg) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative.'
      });
    }

    // Default image based on category if none provided
    const defaultImages = {
      Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
      Rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      Dal: 'https://images.unsplash.com/photo-1599307767316-776533bb941c?w=600&auto=format&fit=crop&q=80',
      Millets: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80',
      Pulses: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      Oilseeds: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',
      Spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      Barley: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80',
      Corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
      Oats: 'https://images.unsplash.com/photo-1614961233913-a5113a4a346f?w=600&auto=format&fit=crop&q=80',
      Other: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'
    };

    const productImage = image && image.trim() !== '' ? image.trim() : (defaultImages[category] || defaultImages.Wheat);

    const product = await Product.create({
      name: name.trim(),
      category,
      pricePerKg: Number(pricePerKg),
      stockKg: Number(stockKg),
      image: productImage,
      description: description ? description.trim() : '',
      farmer: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully!',
      product
    });
  } catch (error) {
    console.error('Add Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding product.'
    });
  }
};

/**
 * @desc   Update an existing product
 * @route  PUT /api/farmers/products/:id
 * @access Private (Farmer)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, pricePerKg, stockKg, image, description } = req.body;

    const product = await Product.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not owned by you.'
      });
    }

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (pricePerKg !== undefined) product.pricePerKg = Number(pricePerKg);
    if (stockKg !== undefined) product.stockKg = Number(stockKg);
    if (image !== undefined) product.image = image.trim();
    if (description !== undefined) product.description = description.trim();

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating product.'
    });
  }
};

/**
 * @desc   Delete a product
 * @route  DELETE /api/farmers/products/:id
 * @access Private (Farmer)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not authorized to delete.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting product.'
    });
  }
};

/**
 * @desc   Get incoming orders for the logged-in farmer
 * @route  GET /api/farmers/orders
 * @access Private (Farmer)
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get Farmer Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching incoming orders.'
    });
  }
};

/**
 * @desc   Update status of an order (Accept, Reject, Packed, Shipped, Delivered)
 * @route  PUT /api/farmers/orders/:id/status
 * @access Private (Farmer)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = ['accepted', 'rejected', 'packed', 'shipped', 'delivered'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to you.'
      });
    }

    // If order was rejected, restore stock
    if (status === 'rejected' && order.orderStatus !== 'rejected') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockKg: item.quantityKg }
        });
      }
    }

    // If order is delivered, mark COD payment as completed
    if (status === 'delivered') {
      order.paymentStatus = 'completed';
      await Payment.findOneAndUpdate(
        { order: order._id },
        { status: 'completed', transactionDate: new Date() }
      );
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status} by farmer`
    });
    order.updatedAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}" successfully!`,
      order
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating order status.'
    });
  }
};

/**
 * @desc   Get farmer earnings, payout status from Admin, and dashboard statistics
 * @route  GET /api/farmers/earnings
 * @access Private (Farmer)
 */
exports.getEarnings = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const farmer = await Farmer.findById(farmerId);

    // Total products listed
    const totalProducts = await Product.countDocuments({ farmer: farmerId });

    // All orders for this farmer
    const orders = await Order.find({ farmer: farmerId });

    let totalEarnings = 0; // sum of delivered orders
    let pendingEarnings = 0; // sum of active non-delivered/non-rejected orders
    let statusCounts = {
      pending: 0,
      accepted: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      rejected: 0
    };

    orders.forEach(order => {
      const status = order.orderStatus;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }

      if (status === 'delivered') {
        totalEarnings += order.totalAmount;
      } else if (status !== 'rejected') {
        pendingEarnings += order.totalAmount;
      }
    });

    const settledPayoutAmount = farmer ? (farmer.settledPayoutAmount || 0) : 0;
    const pendingPayoutFromAdmin = Math.max(0, totalEarnings - settledPayoutAmount);

    return res.status(200).json({
      success: true,
      stats: {
        totalEarnings,
        pendingEarnings,
        settledPayoutAmount,
        pendingPayoutFromAdmin,
        totalOrders: orders.length,
        totalProducts,
        statusCounts,
        upiId: farmer ? farmer.upiId : ''
      }
    });
  } catch (error) {
    console.error('Get Farmer Earnings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching earnings.'
    });
  }
};

/**
 * @desc   Get farmer personal payout UPI ID & Bank Details
 * @route  GET /api/farmers/bank-details
 * @access Private (Farmer)
 */
exports.getBankDetails = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    return res.status(200).json({
      success: true,
      bankDetails: {
        upiId: farmer.upiId || '',
        bankAccount: farmer.bankAccount || '',
        bankIfsc: farmer.bankIfsc || '',
        bankName: farmer.bankName || '',
        accountHolderName: farmer.accountHolderName || farmer.name,
        settledPayoutAmount: farmer.settledPayoutAmount || 0
      }
    });
  } catch (error) {
    console.error('Get Farmer Bank Details Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving bank details.' });
  }
};

/**
 * @desc   Update farmer personal payout UPI ID & Bank Details
 * @route  PUT /api/farmers/bank-details
 * @access Private (Farmer)
 */
exports.updateBankDetails = async (req, res) => {
  try {
    const { upiId, bankAccount, bankIfsc, bankName, accountHolderName } = req.body;
    const farmer = await Farmer.findById(req.user.id);

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    if (upiId !== undefined) farmer.upiId = upiId.trim();
    if (bankAccount !== undefined) farmer.bankAccount = bankAccount.trim();
    if (bankIfsc !== undefined) farmer.bankIfsc = bankIfsc.trim().toUpperCase();
    if (bankName !== undefined) farmer.bankName = bankName.trim();
    if (accountHolderName !== undefined) farmer.accountHolderName = accountHolderName.trim();

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: 'Your payout UPI ID & Bank Details saved successfully!',
      bankDetails: {
        upiId: farmer.upiId,
        bankAccount: farmer.bankAccount,
        bankIfsc: farmer.bankIfsc,
        bankName: farmer.bankName,
        accountHolderName: farmer.accountHolderName
      }
    });
  } catch (error) {
    console.error('Update Farmer Bank Details Error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving bank details.' });
  }
};

