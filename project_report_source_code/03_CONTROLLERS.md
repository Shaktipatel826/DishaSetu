# DishaSetu — Part 3: Backend Business Logic and MVC Controllers

## File: authController.js
- **Path:** /controllers/authController.js
- **Purpose:** Student and admin registration, login, logout, and profile controller

`javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Helper to sign JWT token
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'dishasetu_super_secret_jwt_key_2026_student_portal';
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

    // Check existing account across User and Admin models
    const existingUser = await User.findOne({ email: emailNormalized });
    const existingAdmin = await Admin.findOne({ email: emailNormalized });

    if (existingUser || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
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
 * Legacy Support: Register Farmer / Customer aliases
 */
exports.registerFarmer = async (req, res) => {
  return exports.registerUser(req, res);
};

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
    
    // Check Admin model if not found in User model
    if (!user) {
      user = await Admin.findOne({ email: emailNormalized });
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
 * @desc   Logout User
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
 * @desc   Get Current User Session
 * @route  GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = await User.findById(id).select('-password');

    if (!user && role === 'admin') {
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
 * @desc   Update Profile
 * @route  PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, phone, age, education, state, category, languagePreference } = req.body;

    let user = await User.findById(id);

    if (!user) {
      user = await Admin.findById(id);
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

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: userObj
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};

`

---

## File: opportunityController.js
- **Path:** /controllers/opportunityController.js
- **Purpose:** Opportunity listing, detail view, filtering, and admin CRUD controller

`javascript
const Opportunity = require('../models/Opportunity');

/**
 * @desc   Get all opportunities with search and filtering
 * @route  GET /api/opportunities
 * @access Public
 */
exports.getOpportunities = async (req, res) => {
  try {
    const { search, type, education, state, category, age, status, latest, limit } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (latest === 'true') {
      query.showInLatestUpdates = true;
    }

    if (education && education !== 'Any') {
      query.$or = [
        { 'eligibility.education': { $in: [education, 'Any', 'All'] } },
        { 'eligibility.education': { $size: 0 } }
      ];
    }

    if (state && state !== 'All India') {
      query.$or = [
        { 'eligibility.state': { $in: [state, 'All India', 'All'] } },
        { 'eligibility.state': { $size: 0 } }
      ];
    }

    if (category && category !== 'All') {
      query.$or = [
        { 'eligibility.category': { $in: [category, 'All', 'General'] } },
        { 'eligibility.category': { $size: 0 } }
      ];
    }

    if (age) {
      const userAge = Number(age);
      if (!isNaN(userAge)) {
        query['eligibility.minAge'] = { $lte: userAge };
        query['eligibility.maxAge'] = { $gte: userAge };
      }
    }

    let resultQuery = Opportunity.find(query).sort({ lastDate: 1, createdAt: -1 });

    if (limit) {
      resultQuery = resultQuery.limit(Number(limit));
    }

    const opportunities = await resultQuery;

    return res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (error) {
    console.error('Get Opportunities Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching opportunities.'
    });
  }
};

/**
 * @desc   Get single opportunity by ID
 * @route  GET /api/opportunities/:id
 * @access Public
 */
exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.'
      });
    }

    return res.status(200).json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Get Opportunity Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching opportunity details.'
    });
  }
};

/**
 * @desc   Get Latest Updates Ticker items
 * @route  GET /api/opportunities/ticker
 * @access Public
 */
exports.getLatestUpdatesTicker = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ showInLatestUpdates: true, status: { $ne: 'CLOSED' } })
      .select('title type lastDate applyUrl status')
      .limit(10);

    return res.status(200).json({
      success: true,
      count: opportunities.length,
      items: opportunities
    });
  } catch (error) {
    console.error('Ticker Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching latest ticker items.'
    });
  }
};

/**
 * @desc   Evaluate Eligibility for Student Criteria
 * @route  POST /api/opportunities/check-eligibility
 * @access Public
 */
exports.checkEligibility = async (req, res) => {
  try {
    const { age, education, state, category } = req.body;
    const userAge = Number(age);

    const allOps = await Opportunity.find({ status: { $ne: 'CLOSED' } });

    const evaluated = allOps.map(op => {
      const criteria = {
        age: false,
        education: false,
        state: false,
        category: false
      };

      const reasons = [];

      // 1. Age Check
      if (!isNaN(userAge) && userAge > 0) {
        const min = op.eligibility.minAge || 0;
        const max = op.eligibility.maxAge || 100;
        if (userAge >= min && userAge <= max) {
          criteria.age = true;
        } else {
          reasons.push(`Required Age: ${min}–${max} (Your Age: ${userAge})`);
        }
      } else {
        criteria.age = true;
      }

      // 2. Education Check
      const edList = op.eligibility.education || [];
      if (edList.length === 0 || edList.includes('Any') || edList.includes('All') || edList.includes(education)) {
        criteria.education = true;
      } else {
        reasons.push(`Required Education: ${edList.join(', ')}`);
      }

      // 3. State Check
      const stList = op.eligibility.state || [];
      if (stList.length === 0 || stList.includes('All India') || stList.includes('All') || stList.includes(state)) {
        criteria.state = true;
      } else {
        reasons.push(`Required State: ${stList.join(', ')}`);
      }

      // 4. Category Check
      const catList = op.eligibility.category || [];
      if (catList.length === 0 || catList.includes('All') || catList.includes('General') || catList.includes(category)) {
        criteria.category = true;
      } else {
        reasons.push(`Required Category: ${catList.join(', ')}`);
      }

      const matchCount = Object.values(criteria).filter(Boolean).length;
      let status = 'NOT_ELIGIBLE';
      if (matchCount === 4) status = 'ELIGIBLE';
      else if (matchCount >= 2) status = 'LIKELY_ELIGIBLE';

      return {
        opportunity: op,
        status,
        matchCount,
        totalCriteria: 4,
        criteria,
        reasons
      };
    });

    // Sort by highest match score
    evaluated.sort((a, b) => b.matchCount - a.matchCount);

    return res.status(200).json({
      success: true,
      count: evaluated.length,
      results: evaluated
    });
  } catch (error) {
    console.error('Check Eligibility Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error evaluating eligibility.'
    });
  }
};

/**
 * Admin: Create Opportunity
 */
exports.createOpportunity = async (req, res) => {
  try {
    if (req.body.title && typeof req.body.title === 'string') {
      const cleanTitle = req.body.title.trim();
      req.body.title = { en: cleanTitle, hi: cleanTitle };
    }
    const opportunity = await Opportunity.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Opportunity created successfully!',
      opportunity
    });
  } catch (error) {
    console.error('Create Opportunity Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating opportunity.'
    });
  }
};

/**
 * Admin: Update Opportunity
 */
exports.updateOpportunity = async (req, res) => {
  try {
    if (req.body.title && typeof req.body.title === 'string') {
      const cleanTitle = req.body.title.trim();
      req.body.title = { en: cleanTitle, hi: cleanTitle };
    }
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully!',
      opportunity
    });
  } catch (error) {
    console.error('Update Opportunity Error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete Opportunity
 */
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }
    return res.status(200).json({ success: true, message: 'Opportunity deleted successfully.' });
  } catch (error) {
    console.error('Delete Opportunity Error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting opportunity.' });
  }
};

`

---

## File: schemeController.js
- **Path:** /controllers/schemeController.js
- **Purpose:** Government scheme query, sector filter, and admin CRUD controller

`javascript
const Scheme = require('../models/Scheme');

/**
 * @desc   Get all government schemes with filtering & search
 * @route  GET /api/schemes
 * @access Public
 */
exports.getSchemes = async (req, res) => {
  try {
    const { search, sector, governmentType, stateName, category, status, limit } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } }
      ];
    }

    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    if (governmentType && governmentType !== 'All') {
      query.governmentType = governmentType;
    }

    if (stateName && stateName !== 'All India') {
      query.$or = [
        { stateName: stateName },
        { stateName: 'All India' }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.$or = [
        { 'eligibility.category': { $in: [category, 'All', 'General'] } },
        { 'eligibility.category': { $size: 0 } }
      ];
    }

    let resultQuery = Scheme.find(query).sort({ createdAt: -1 });

    if (limit) {
      resultQuery = resultQuery.limit(Number(limit));
    }

    const schemes = await resultQuery;

    return res.status(200).json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    console.error('Get Schemes Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching government schemes.'
    });
  }
};

/**
 * @desc   Get single scheme by ID
 * @route  GET /api/schemes/:id
 * @access Public
 */
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Government scheme not found.'
      });
    }

    return res.status(200).json({
      success: true,
      scheme
    });
  } catch (error) {
    console.error('Get Scheme Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching scheme details.'
    });
  }
};

/**
 * Admin: Create Scheme
 */
exports.createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Government scheme created successfully!',
      scheme
    });
  } catch (error) {
    console.error('Create Scheme Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating scheme.'
    });
  }
};

/**
 * Admin: Update Scheme
 */
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Government scheme updated successfully!',
      scheme
    });
  } catch (error) {
    console.error('Update Scheme Error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete Scheme
 */
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    return res.status(200).json({ success: true, message: 'Government scheme deleted successfully.' });
  } catch (error) {
    console.error('Delete Scheme Error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting scheme.' });
  }
};

`

---

## File: submissionController.js
- **Path:** /controllers/submissionController.js
- **Purpose:** Student submission handling, file upload, admin approval, and proof streaming

`javascript
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Opportunity = require('../models/Opportunity');
const Scheme = require('../models/Scheme');
const Notification = require('../models/Notification');

/**
 * @desc    Submit a new student opportunity or government scheme with proof upload
 * @route   POST /api/submissions
 * @access  Private (Student / User)
 */
exports.createSubmission = async (req, res, next) => {
  try {
    const {
      title,
      categoryType,
      type,
      organization,
      description,
      sourceUrl,
      benefits,
      lastDate,
      applyUrl,
      minAge,
      maxAge,
      education,
      state,
      category,
      eligibilityDetails
    } = req.body;

    if (!title || !sourceUrl || !lastDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Source URL, and Last Application Date.'
      });
    }

    // Extract uploaded verification proof and public banner files
    let proofFile = null;
    let bannerFile = null;

    if (req.files) {
      if (req.files.proof && req.files.proof[0]) proofFile = req.files.proof[0];
      else if (req.files.verificationImage && req.files.verificationImage[0]) proofFile = req.files.verificationImage[0];

      if (req.files.banner && req.files.banner[0]) bannerFile = req.files.banner[0];
      else if (req.files.publicBannerImage && req.files.publicBannerImage[0]) bannerFile = req.files.publicBannerImage[0];
    } else if (req.file) {
      proofFile = req.file;
    }

    if (!proofFile) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory verification / proof document file is required.'
      });
    }

    // Private verification proof is served exclusively via protected API endpoint
    const proofUrl = `/api/submissions/proof/${proofFile.filename}`;
    const verificationImage = proofUrl;
    // Public banner is saved in static banners folder
    const publicBannerImage = bannerFile ? `/uploads/banners/${bannerFile.filename}` : '';

    // Parse array eligibility fields if passed as strings/JSON
    const parsedEducation = typeof education === 'string' ? JSON.parse(education || '[]') : (education || []);
    const parsedState = typeof state === 'string' ? JSON.parse(state || '[]') : (state || ['All India']);
    const parsedCategory = typeof category === 'string' ? JSON.parse(category || '[]') : (category || ['All']);

    // Normalize categoryType canonical value
    let normalizedCategoryType = 'Opportunity';
    if (categoryType === 'Government Scheme' || categoryType === 'government_scheme') {
      normalizedCategoryType = 'Government Scheme';
    } else {
      normalizedCategoryType = 'Opportunity';
    }

    const submission = await Submission.create({
      title,
      categoryType: normalizedCategoryType,
      type: type || 'Scholarship',
      organization: organization || '',
      description: description || '',
      sourceUrl,
      proofUrl,
      verificationImage,
      publicBannerImage,
      proofOriginalName: proofFile.originalname,
      eligibility: {
        minAge: Number(minAge) || 0,
        maxAge: Number(maxAge) || 100,
        education: parsedEducation,
        state: parsedState,
        category: parsedCategory,
        details: eligibilityDetails || ''
      },
      benefits: benefits || '',
      lastDate: new Date(lastDate),
      applyUrl: applyUrl || sourceUrl,
      submittedBy: req.user.id,
      status: 'Pending Review'
    });

    // Create student notification upon successful submission
    if (req.user && req.user.id) {
      try {
        const notifTitle = `Submission Received: ${title}`;
        const notifMsg = `Your opportunity submission "${title}" has been received and is pending admin verification.`;
        await Notification.create({
          userId: req.user.id,
          title: { en: notifTitle, hi: notifTitle },
          message: { en: notifMsg, hi: notifMsg },
          targetUrl: 'my-submissions.html'
        });
      } catch (notifErr) {
        console.warn('Could not create submission notification:', notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity submitted successfully! Our verification team will review your proof and public banner.',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get submissions submitted by current logged-in student
 * @route   GET /api/submissions/my
 * @access  Private (Student / User)
 */
exports.getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submissions for Admin Review Console with status & search filters
 * @route   GET /api/submissions/admin
 * @access  Private (Admin Only)
 */
exports.getAllSubmissionsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'name email role phone')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single submission by ID
 * @route   GET /api/submissions/:id
 * @access  Private
 */
exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('submittedBy', 'name email role phone')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    // Check ownership or admin status
    if (req.user.role !== 'admin' && submission.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update submission review status (Approve / Reject / Request Changes)
 * @route   PUT /api/submissions/admin/:id/status
 * @access  Private (Admin Only)
 */
exports.updateSubmissionStatusAdmin = async (req, res, next) => {
  try {
    const { status, adminFeedback } = req.body;

    const allowedStatuses = ['Pending Review', 'Under Review', 'Changes Requested', 'Approved', 'Rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: [${allowedStatuses.join(', ')}]`
      });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    submission.status = status;
    submission.adminFeedback = adminFeedback !== undefined ? adminFeedback : submission.adminFeedback;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();

    // IF APPROVED: Automatically convert submission to official MongoDB Opportunity or Scheme record!
    if (status === 'Approved' && !submission.createdOpportunityId && !submission.createdSchemeId) {
      if (submission.categoryType === 'Government Scheme' || submission.type === 'Government Scheme') {
        // Create official Scheme
        const newScheme = await Scheme.create({
          title: { en: submission.title, hi: submission.title },
          sector: 'Social Welfare',
          governmentType: 'Central',
          stateName: submission.eligibility.state[0] || 'All India',
          description: { en: submission.description, hi: submission.description },
          eligibility: {
            minAge: submission.eligibility.minAge,
            maxAge: submission.eligibility.maxAge,
            education: submission.eligibility.education,
            category: submission.eligibility.category,
            details: { en: submission.eligibility.details, hi: submission.eligibility.details }
          },
          benefits: { en: submission.benefits, hi: submission.benefits },
          lastDate: submission.lastDate,
          status: 'OPEN',
          applyUrl: submission.applyUrl || submission.sourceUrl,
          showInLatestUpdates: true
        });
        submission.createdSchemeId = newScheme._id;
      } else {
        // Create official Opportunity with public banner image (private verification proof is NOT copied)
        const newOpp = await Opportunity.create({
          title: { en: submission.title, hi: submission.title },
          type: submission.type,
          description: { en: submission.description, hi: submission.description },
          eligibility: {
            minAge: submission.eligibility.minAge,
            maxAge: submission.eligibility.maxAge,
            education: submission.eligibility.education,
            state: submission.eligibility.state,
            category: submission.eligibility.category,
            details: { en: submission.eligibility.details, hi: submission.eligibility.details }
          },
          benefits: { en: submission.benefits, hi: submission.benefits },
          lastDate: submission.lastDate,
          status: 'OPEN',
          applyUrl: submission.applyUrl || submission.sourceUrl,
          publicBannerImage: submission.publicBannerImage || '',
          showInLatestUpdates: true
        });
        submission.createdOpportunityId = newOpp._id;
      }
    }

    await submission.save();

    // Create student notification
    if (submission.submittedBy) {
      try {
        const notifTitle = `Submission Status Update: ${submission.title}`;
        const notifMsg = `Your submitted opportunity "${submission.title}" has been updated to "${status}". ${adminFeedback ? 'Admin note: ' + adminFeedback : ''}`;
        await Notification.create({
          userId: submission.submittedBy,
          title: { en: notifTitle, hi: notifTitle },
          message: { en: notifMsg, hi: notifMsg },
          targetUrl: 'my-submissions.html'
        });
      } catch (notifErr) {
        console.warn('Could not create student notification:', notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Submission status updated to ${status}.`,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream private verification proof document securely (Admin Only)
 * @route   GET /api/submissions/proof/:filename
 * @access  Private (Admin Only)
 */
exports.getProofFile = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const privateDir = process.env.PRIVATE_PROOF_DIR || path.join(__dirname, '..', 'private_uploads', 'proofs');
    const legacyDir = path.join(__dirname, '..', 'public', 'uploads', 'proofs');

    const primaryPath = path.join(privateDir, filename);
    const fallbackPath = path.join(legacyDir, filename);

    if (fs.existsSync(primaryPath)) {
      return res.sendFile(primaryPath);
    } else if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    } else {
      return res.status(404).json({
        success: false,
        message: 'Verification proof document not found.'
      });
    }
  } catch (error) {
    next(error);
  }
};

`

---

## File: savedItemController.js
- **Path:** /controllers/savedItemController.js
- **Purpose:** Bookmarking, deadline reminders, and saved list controller

`javascript
const SavedItem = require('../models/SavedItem');
const Opportunity = require('../models/Opportunity');
const Scheme = require('../models/Scheme');

/**
 * Calculate reminderDate based on lastDate and preference
 */
function calculateReminderDate(lastDate, preference) {
  if (!lastDate || preference === 'none') return null;

  const deadline = new Date(lastDate);
  const reminder = new Date(deadline);

  if (preference === '7_days') reminder.setDate(deadline.getDate() - 7);
  else if (preference === '3_days') reminder.setDate(deadline.getDate() - 3);
  else if (preference === '1_day') reminder.setDate(deadline.getDate() - 1);
  else if (preference === 'deadline_day') reminder.setDate(deadline.getDate());

  return reminder;
}

/**
 * @desc   Save an Opportunity or Scheme with reminder preferences
 * @route  POST /api/saved
 * @access Private
 */
exports.saveItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId, reminderPreference } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type (Opportunity or Scheme) and item ID are required.'
      });
    }

    let lastDate = null;
    let opportunityId = null;
    let schemeId = null;

    if (itemType === 'Opportunity') {
      const opp = await Opportunity.findById(itemId);
      if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });
      lastDate = opp.lastDate;
      opportunityId = itemId;
    } else if (itemType === 'Scheme') {
      const sch = await Scheme.findById(itemId);
      if (!sch) return res.status(404).json({ success: false, message: 'Scheme not found.' });
      lastDate = sch.lastDate;
      schemeId = itemId;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid itemType.' });
    }

    const pref = reminderPreference || '3_days';
    const reminderDate = calculateReminderDate(lastDate, pref);
    const reminderStatus = (pref === 'none') ? 'disabled' : 'pending';

    // Find existing saved record to update or create new
    let savedItem = null;
    if (opportunityId) {
      savedItem = await SavedItem.findOne({ userId, opportunityId });
    } else if (schemeId) {
      savedItem = await SavedItem.findOne({ userId, schemeId });
    }

    if (savedItem) {
      savedItem.reminderPreference = pref;
      savedItem.reminderDate = reminderDate;
      savedItem.reminderStatus = reminderStatus;
      await savedItem.save();
    } else {
      savedItem = await SavedItem.create({
        userId,
        itemType,
        opportunityId,
        schemeId,
        reminderPreference: pref,
        reminderDate,
        reminderStatus
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item saved successfully with reminder preference!',
      savedItem
    });
  } catch (error) {
    console.error('Save Item Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving opportunity.'
    });
  }
};

/**
 * @desc   Get all saved items for user
 * @route  GET /api/saved
 * @access Private
 */
exports.getUserSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedItems = await SavedItem.find({ userId })
      .populate('opportunityId')
      .populate('schemeId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: savedItems.length,
      savedItems
    });
  } catch (error) {
    console.error('Get Saved Items Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching saved items.'
    });
  }
};

/**
 * @desc   Update reminder preference
 * @route  PUT /api/saved/:id/reminder
 * @access Private
 */
exports.updateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reminderPreference } = req.body;

    const savedItem = await SavedItem.findOne({ _id: req.params.id, userId })
      .populate('opportunityId')
      .populate('schemeId');

    if (!savedItem) {
      return res.status(404).json({ success: false, message: 'Saved item not found.' });
    }

    const item = savedItem.opportunityId || savedItem.schemeId;
    const lastDate = item ? item.lastDate : null;

    savedItem.reminderPreference = reminderPreference;
    savedItem.reminderDate = calculateReminderDate(lastDate, reminderPreference);
    savedItem.reminderStatus = (reminderPreference === 'none') ? 'disabled' : 'pending';

    await savedItem.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder preference updated successfully!',
      savedItem
    });
  } catch (error) {
    console.error('Update Reminder Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating reminder.' });
  }
};

/**
 * @desc   Remove saved item
 * @route  DELETE /api/saved/:id
 * @access Private
 */
exports.removeSavedItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedItem = await SavedItem.findOneAndDelete({ _id: req.params.id, userId });

    if (!savedItem) {
      return res.status(404).json({ success: false, message: 'Saved item not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from saved list.'
    });
  } catch (error) {
    console.error('Remove Saved Item Error:', error);
    return res.status(500).json({ success: false, message: 'Error removing saved item.' });
  }
};

`

---

## File: notificationController.js
- **Path:** /controllers/notificationController.js
- **Purpose:** User notifications and mark-as-read controller

`javascript
const Notification = require('../models/Notification');

/**
 * Get User Notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching notifications.' });
  }
};

/**
 * Mark Notifications as Read
 */
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark Read Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating notifications.' });
  }
};

`

---

## File: adminController.js
- **Path:** /controllers/adminController.js
- **Purpose:** Admin dashboard analytics, system stats, and student directory controller

`javascript
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Scheme = require('../models/Scheme');
const Submission = require('../models/Submission');

/**
 * @desc   Get DishaSetu Admin Dashboard Statistics
 * @route  GET /api/admin/dashboard-stats
 * @access Private (Admin)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalOpportunities,
      totalSchemes,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      activeOpportunities,
      activeSchemes
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['student', 'user'] } }),
      Opportunity.countDocuments(),
      Scheme.countDocuments(),
      Submission.countDocuments({ status: 'Pending Review' }),
      Submission.countDocuments({ status: 'Approved' }),
      Submission.countDocuments({ status: 'Rejected' }),
      Opportunity.countDocuments({ status: { $in: ['OPEN', 'CLOSING SOON'] } }),
      Scheme.countDocuments({ status: { $in: ['OPEN', 'CLOSING SOON'] } })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalOpportunities,
        totalSchemes,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        activeOpportunities,
        activeSchemes,
        totalActive: activeOpportunities + activeSchemes
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching admin dashboard stats.'
    });
  }
};

/**
 * @desc   Get all registered students (with search & education/state filters, passwords hidden)
 * @route  GET /api/admin/students
 * @access Private (Admin)
 */
exports.getRegisteredStudents = async (req, res) => {
  try {
    const { search, education, state, category } = req.query;
    let query = { role: { $in: ['student', 'user'] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (education && education !== 'All') {
      query.education = education;
    }

    if (state && state !== 'All') {
      query.state = state;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // Exclude password hash from query results for security
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Populate submission counts for each student
    const studentsWithMeta = await Promise.all(
      students.map(async (student) => {
        const totalSubmissions = await Submission.countDocuments({ submittedBy: student._id });
        const approvedSubmissions = await Submission.countDocuments({ submittedBy: student._id, status: 'Approved' });
        return {
          ...student.toObject(),
          totalSubmissions,
          approvedSubmissions
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: studentsWithMeta.length,
      students: studentsWithMeta
    });
  } catch (error) {
    console.error('Admin Get Students Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving registered students.'
    });
  }
};

/**
 * @desc   Delete student account
 * @route  DELETE /api/admin/students/:id
 * @access Private (Admin)
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student "${student.name}" account was removed successfully.`
    });
  } catch (error) {
    console.error('Admin Delete Student Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting student.'
    });
  }
};

`

---

