const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
 * @desc   Register a new Student / User
 * @route  POST /api/auth/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, age, education, state, category } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check existing account
    const existingUser = await User.findOne({ email: emailNormalized });
    const existingCustomer = await Customer.findOne({ email: emailNormalized });
    const existingFarmer = await Farmer.findOne({ email: emailNormalized });
    const existingAdmin = await Admin.findOne({ email: emailNormalized });

    if (existingUser || existingCustomer || existingFarmer || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'student',
      age: age ? Number(age) : null,
      education: education || 'Graduate',
      state: state || 'All India',
      category: category || 'General'
    });

    const token = signToken({
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to DishaSetu.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        education: user.education,
        state: user.state,
        category: user.category,
        languagePreference: user.languagePreference
      }
    });
  } catch (error) {
    console.error('Register User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

/**
 * Legacy Support: Register Farmer
 */
exports.registerFarmer = async (req, res) => {
  return exports.registerUser(req, res);
};

/**
 * Legacy Support: Register Customer
 */
exports.registerCustomer = async (req, res) => {
  return exports.registerUser(req, res);
};

/**
 * @desc   Login user
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    let user = null;

    // Check User model first
    user = await User.findOne({ email: emailNormalized });
    
    // Fallback to Customer / Farmer / Admin if legacy account
    if (!user) {
      if (role === 'farmer') user = await Farmer.findOne({ email: emailNormalized });
      else if (role === 'customer') user = await Customer.findOne({ email: emailNormalized });
      else if (role === 'admin') user = await Admin.findOne({ email: emailNormalized });
      else {
        user = await Admin.findOne({ email: emailNormalized }) ||
               await Customer.findOne({ email: emailNormalized }) ||
               await Farmer.findOne({ email: emailNormalized });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    const userRole = user.role || 'student';

    const token = signToken({
      id: user._id,
      role: userRole,
      email: user.email,
      name: user.name
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        phone: user.phone || '',
        age: user.age || null,
        education: user.education || 'Graduate',
        state: user.state || 'All India',
        category: user.category || 'General',
        languagePreference: user.languagePreference || 'en'
      }
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
 * Logout User
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
 * Get Current User
 */
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = await User.findById(id).select('-password');

    if (!user) {
      if (role === 'admin') user = await Admin.findById(id).select('-password');
      else if (role === 'customer') user = await Customer.findById(id).select('-password');
      else if (role === 'farmer') user = await Farmer.findById(id).select('-password');
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
 * Update Profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, phone, age, education, state, category, languagePreference } = req.body;

    let user = await User.findById(id);

    if (!user) {
      user = await Admin.findById(id) || await Customer.findById(id) || await Farmer.findById(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (age !== undefined && age !== null) user.age = Number(age);
    if (education) user.education = education;
    if (state) user.state = state.trim();
    if (category) user.category = category;
    if (languagePreference) user.languagePreference = languagePreference;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};
