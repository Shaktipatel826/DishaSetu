const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

// Helper to sign JWT token
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'kisan_direct_super_secret_jwt_key_2026_agro_market';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Helper to set httpOnly cookie
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * @desc   Register a new Farmer
 * @route  POST /api/auth/register-farmer
 * @access Public
 */
exports.registerFarmer = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, password, phone, location) are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check if email already registered across roles
    const existingFarmer = await Farmer.findOne({ email: emailNormalized });
    const existingCustomer = await Customer.findOne({ email: emailNormalized });
    const existingAdmin = await Admin.findOne({ email: emailNormalized });

    if (existingFarmer || existingCustomer || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const farmer = await Farmer.create({
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      phone: phone.trim(),
      location: location.trim(),
      role: 'farmer'
    });

    const token = signToken({
      id: farmer._id,
      role: 'farmer',
      email: farmer.email,
      name: farmer.name
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Farmer registration successful!',
      user: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        location: farmer.location,
        role: 'farmer'
      }
    });
  } catch (error) {
    console.error('Register Farmer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during farmer registration.'
    });
  }
};

/**
 * @desc   Register a new Customer
 * @route  POST /api/auth/register-customer
 * @access Public
 */
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, password, phone, address) are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check if email already registered
    const existingCustomer = await Customer.findOne({ email: emailNormalized });
    const existingFarmer = await Farmer.findOne({ email: emailNormalized });
    const existingAdmin = await Admin.findOne({ email: emailNormalized });

    if (existingCustomer || existingFarmer || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await Customer.create({
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      role: 'customer'
    });

    const token = signToken({
      id: customer._id,
      role: 'customer',
      email: customer.email,
      name: customer.name
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Customer registration successful!',
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Register Customer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during customer registration.'
    });
  }
};

/**
 * @desc   Login user (Farmer, Customer, or Admin)
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role selection are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    let user = null;

    if (role === 'farmer') {
      user = await Farmer.findOne({ email: emailNormalized });
    } else if (role === 'customer') {
      user = await Customer.findOne({ email: emailNormalized });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email: emailNormalized });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be farmer, customer, or admin.'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `No ${role} account found with this email address.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    const token = signToken({
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    });

    setAuthCookie(res, token);

    // Filter user details for response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      location: user.location || '',
      address: user.address || ''
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userData
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

/**
 * @desc   Logout current user
 * @route  POST /api/auth/logout
 * @access Public
 */
exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @desc   Get current authenticated user info
 * @route  GET /api/auth/me
 * @access Private (Requires valid token)
 */
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = null;

    if (role === 'farmer') {
      user = await Farmer.findById(id).select('-password');
    } else if (role === 'customer') {
      user = await Customer.findById(id).select('-password');
    } else if (role === 'admin') {
      user = await Admin.findById(id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user session.'
    });
  }
};

/**
 * @desc   Update user profile
 * @route  PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { name, phone, location, address } = req.body;

    let user = null;

    if (role === 'farmer') {
      user = await Farmer.findById(id);
      if (user) {
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (location) user.location = location.trim();
        await user.save();
      }
    } else if (role === 'customer') {
      user = await Customer.findById(id);
      if (user) {
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (address) user.address = address.trim();
        await user.save();
      }
    } else if (role === 'admin') {
      user = await Admin.findById(id);
      if (user && name) {
        user.name = name.trim();
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        location: user.location || '',
        address: user.address || ''
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};
