const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc   Get current customer's shopping cart
 * @route  GET /api/customers/cart
 * @access Private (Customer)
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id })
      .populate({
        path: 'items.product',
        populate: {
          path: 'farmer',
          select: 'name location phone'
        }
      });

    if (!cart) {
      cart = await Cart.create({ customer: req.user.id, items: [] });
    }

    // Filter out any items where product might have been deleted
    const validItems = cart.items.filter(item => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    let subtotal = 0;
    const formattedItems = cart.items.map(item => {
      const p = item.product;
      const itemSubtotal = (p.pricePerKg || 0) * item.quantityKg;
      subtotal += itemSubtotal;

      return {
        product: {
          id: p._id,
          name: p.name,
          category: p.category,
          pricePerKg: p.pricePerKg,
          stockKg: p.stockKg,
          image: p.image,
          farmer: p.farmer ? {
            id: p.farmer._id,
            name: p.farmer.name,
            location: p.farmer.location
          } : null
        },
        quantityKg: item.quantityKg,
        subtotal: itemSubtotal
      };
    });

    return res.status(200).json({
      success: true,
      cart: {
        id: cart._id,
        items: formattedItems,
        totalItems: formattedItems.reduce((acc, curr) => acc + curr.quantityKg, 0),
        subtotal,
        deliveryFee: 0, // Free direct-farm delivery promo
        totalAmount: subtotal
      }
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving cart.'
    });
  }
};

/**
 * @desc   Add an item to the shopping cart
 * @route  POST /api/customers/cart
 * @access Private (Customer)
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantityKg = 1 } = req.body;
    const qty = Number(quantityKg);

    if (!productId || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID and positive quantity are required.'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (product.stockKg <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this product is currently out of stock.'
      });
    }

    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) {
      cart = new Cart({ customer: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Existing item, check combined stock
      const newQty = cart.items[itemIndex].quantityKg + qty;
      if (newQty > product.stockKg) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockKg} kg available in stock for ${product.name}.`
        });
      }
      cart.items[itemIndex].quantityKg = newQty;
    } else {
      // New item
      if (qty > product.stockKg) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockKg} kg available in stock for ${product.name}.`
        });
      }
      cart.items.push({ product: productId, quantityKg: qty });
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: `Added ${product.name} (${qty} kg) to your cart!`
    });
  } catch (error) {
    console.error('Add To Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to cart.'
    });
  }
};

/**
 * @desc   Update quantity of an item in the cart
 * @route  PUT /api/customers/cart/:productId
 * @access Private (Customer)
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantityKg } = req.body;
    const qty = Number(quantityKg);

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1 kg. To remove item, use delete.'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (qty > product.stockKg) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockKg} kg available in stock.`
      });
    }

    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.'
      });
    }

    item.quantityKg = qty;
    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart item quantity updated!'
    });
  } catch (error) {
    console.error('Update Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart.'
    });
  }
};

/**
 * @desc   Remove item from cart
 * @route  DELETE /api/customers/cart/:productId
 * @access Private (Customer)
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    console.error('Remove From Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing item from cart.'
    });
  }
};

/**
 * @desc   Clear entire cart
 * @route  DELETE /api/customers/cart
 * @access Private (Customer)
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared.'
    });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing cart.'
    });
  }
};
