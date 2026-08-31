const Admin = require('../models/Admin');
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');

/**
 * @desc   Get admin dashboard overall statistics
 * @route  GET /api/admin/stats
 * @access Private (Admin)
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalFarmers,
      totalCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalFeedback
    ] = await Promise.all([
      Farmer.countDocuments(),
      Customer.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Feedback.countDocuments()
    ]);

    // Calculate total platform transaction value from delivered orders
    const orders = await Order.find({ orderStatus: 'delivered' });
    const totalMarketplaceVolume = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalFarmers,
        totalCustomers,
        totalProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalFeedback,
        totalMarketplaceVolume
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching admin stats.'
    });
  }
};

/**
 * @desc   Get all registered farmers
 * @route  GET /api/admin/farmers
 * @access Private (Admin)
 */
exports.getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password').sort({ createdAt: -1 });

    // Attach product counts for each farmer
    const farmersWithMeta = await Promise.all(
      farmers.map(async (f) => {
        const productCount = await Product.countDocuments({ farmer: f._id });
        const orderCount = await Order.countDocuments({ farmer: f._id });
        return {
          ...f.toObject(),
          productCount,
          orderCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: farmersWithMeta.length,
      farmers: farmersWithMeta
    });
  } catch (error) {
    console.error('Admin Get Farmers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving farmers.'
    });
  }
};

/**
 * @desc   Delete a farmer and their products
 * @route  DELETE /api/admin/farmers/:id
 * @access Private (Admin)
 */
exports.deleteFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found.'
      });
    }

    // Delete farmer's products
    await Product.deleteMany({ farmer: req.params.id });

    return res.status(200).json({
      success: true,
      message: `Farmer "${farmer.name}" and their listed products were removed.`
    });
  } catch (error) {
    console.error('Admin Delete Farmer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting farmer.'
    });
  }
};

/**
 * @desc   Get all registered customers
 * @route  GET /api/admin/customers
 * @access Private (Admin)
 */
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });

    const customersWithMeta = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ customer: c._id });
        return {
          ...c.toObject(),
          orderCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: customersWithMeta.length,
      customers: customersWithMeta
    });
  } catch (error) {
    console.error('Admin Get Customers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving customers.'
    });
  }
};

/**
 * @desc   Delete a customer
 * @route  DELETE /api/admin/customers/:id
 * @access Private (Admin)
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer "${customer.name}" was removed.`
    });
  } catch (error) {
    console.error('Admin Delete Customer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting customer.'
    });
  }
};

/**
 * @desc   Get all products across the marketplace
 * @route  GET /api/admin/products
 * @access Private (Admin)
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('farmer', 'name location email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Admin Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products.'
    });
  }
};

/**
 * @desc   Delete any product
 * @route  DELETE /api/admin/products/:id
 * @access Private (Admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product "${product.name}" was removed.`
    });
  } catch (error) {
    console.error('Admin Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting product.'
    });
  }
};

/**
 * @desc   Get all orders across the marketplace
 * @route  GET /api/admin/orders
 * @access Private (Admin)
 */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('farmer', 'name location phone email')
      .populate('customer', 'name phone address email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Admin Get Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving orders.'
    });
  }
};

/**
 * @desc   Delete an order
 * @route  DELETE /api/admin/orders/:id
 * @access Private (Admin)
 */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} was deleted.`
    });
  } catch (error) {
    console.error('Admin Delete Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting order.'
    });
  }
};

/**
 * @desc   Get all feedback & reviews across the marketplace
 * @route  GET /api/admin/feedback
 * @access Private (Admin)
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find()
      .populate('customer', 'name email')
      .populate('farmer', 'name location')
      .populate('product', 'name category')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList
    });
  } catch (error) {
    console.error('Admin Get Feedback Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving feedback.'
    });
  }
};

/**
 * @desc   Delete a feedback review (moderation)
 * @route  DELETE /api/admin/feedback/:id
 * @access Private (Admin)
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback removed successfully.'
    });
  } catch (error) {
    console.error('Admin Delete Feedback Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting feedback.'
    });
  }
};

/**
 * @desc   Get platform receiving payment and UPI settings (Admin)
 * @route  GET /api/admin/payment-settings
 * @access Private (Admin)
 */
exports.getPaymentSettings = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    return res.status(200).json({
      success: true,
      settings: {
        upiId: admin.upiId || 'kisandirect@upi',
        businessName: admin.businessName || 'Kisan Direct Marketplace',
        bankAccount: admin.bankAccount || '',
        bankIfsc: admin.bankIfsc || '',
        bankName: admin.bankName || '',
        accountHolderName: admin.accountHolderName || admin.name
      }
    });
  } catch (error) {
    console.error('Get Payment Settings Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving payment settings.' });
  }
};

/**
 * @desc   Update platform receiving payment and UPI settings (Admin)
 * @route  PUT /api/admin/payment-settings
 * @access Private (Admin)
 */
exports.updatePaymentSettings = async (req, res) => {
  try {
    const { upiId, businessName, bankAccount, bankIfsc, bankName, accountHolderName } = req.body;
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    if (upiId) admin.upiId = upiId.trim();
    if (businessName) admin.businessName = businessName.trim();
    if (bankAccount !== undefined) admin.bankAccount = bankAccount.trim();
    if (bankIfsc !== undefined) admin.bankIfsc = bankIfsc.trim().toUpperCase();
    if (bankName !== undefined) admin.bankName = bankName.trim();
    if (accountHolderName !== undefined) admin.accountHolderName = accountHolderName.trim();

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Payment & Bank Receiving Settings saved successfully!',
      settings: {
        upiId: admin.upiId,
        businessName: admin.businessName,
        bankAccount: admin.bankAccount,
        bankIfsc: admin.bankIfsc,
        bankName: admin.bankName,
        accountHolderName: admin.accountHolderName
      }
    });
  } catch (error) {
    console.error('Update Payment Settings Error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving payment settings.' });
  }
};

/**
 * @desc   Public config for checkout page to load active Admin UPI ID & QR Code
 * @route  GET /api/admin/public/payment-config
 * @access Public
 */
exports.getPublicPaymentConfig = async (req, res) => {
  try {
    const admin = await Admin.findOne().sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      config: {
        upiId: admin ? (admin.upiId || 'kisandirect@upi') : 'kisandirect@upi',
        businessName: admin ? (admin.businessName || 'Kisan Direct Marketplace') : 'Kisan Direct Marketplace'
      }
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      config: {
        upiId: 'kisandirect@upi',
        businessName: 'Kisan Direct Marketplace'
      }
    });
  }
};

/**
 * @desc   Get farmer payout settlements list (Admin)
 * @route  GET /api/admin/payouts
 * @access Private (Admin)
 */
exports.getFarmerPayouts = async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password').sort({ createdAt: -1 });

    const payoutsList = await Promise.all(
      farmers.map(async (farmer) => {
        // Calculate all delivered orders for this farmer
        const deliveredOrders = await Order.find({ farmer: farmer._id, orderStatus: 'delivered' });
        const totalDeliveredSales = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const settledAmount = farmer.settledPayoutAmount || 0;
        const pendingPayout = Math.max(0, totalDeliveredSales - settledAmount);

        // Generate dynamic UPI QR Code URL for paying this farmer
        const farmerUpi = farmer.upiId || '';
        let qrUrl = '';
        if (farmerUpi) {
          qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(farmerUpi)}%26pn=${encodeURIComponent(farmer.name)}%26am=${pendingPayout}%26cu=INR`;
        }

        return {
          farmerId: farmer._id,
          name: farmer.name,
          email: farmer.email,
          phone: farmer.phone,
          location: farmer.location,
          upiId: farmer.upiId || 'Not Configured',
          bankAccount: farmer.bankAccount || 'N/A',
          bankIfsc: farmer.bankIfsc || 'N/A',
          bankName: farmer.bankName || 'N/A',
          accountHolderName: farmer.accountHolderName || farmer.name,
          totalDeliveredSales,
          settledAmount,
          pendingPayout,
          farmerQrCodeUrl: qrUrl
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: payoutsList.length,
      payouts: payoutsList
    });
  } catch (error) {
    console.error('Get Farmer Payouts Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching farmer payouts.' });
  }
};

/**
 * @desc   Record settlement/payout transfer to farmer (Admin)
 * @route  POST /api/admin/payouts/:farmerId/settle
 * @access Private (Admin)
 */
exports.settleFarmerPayout = async (req, res) => {
  try {
    const { amount, utr, note } = req.body;
    const settleAmt = Number(amount);

    if (!settleAmt || settleAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive settlement amount required.' });
    }

    const farmer = await Farmer.findById(req.params.farmerId);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    farmer.settledPayoutAmount = (farmer.settledPayoutAmount || 0) + settleAmt;
    await farmer.save();

    // Mark pending delivered orders as settled
    await Order.updateMany(
      { farmer: farmer._id, orderStatus: 'delivered', payoutStatus: 'pending' },
      { payoutStatus: 'settled', payoutUtr: utr || 'ADMIN_SETTLED', payoutDate: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully recorded payout settlement of ₹${settleAmt.toLocaleString('en-IN')} to farmer ${farmer.name}!`,
      farmer: {
        id: farmer._id,
        name: farmer.name,
        settledPayoutAmount: farmer.settledPayoutAmount
      }
    });
  } catch (error) {
    console.error('Settle Farmer Payout Error:', error);
    return res.status(500).json({ success: false, message: 'Server error settling farmer payout.' });
  }
};

