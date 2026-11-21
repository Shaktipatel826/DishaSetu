# DishaSetu — Part 2: Middleware and Express API Route Handlers

## File: auth.js
- **Path:** /middleware/auth.js
- **Purpose:** JWT token verification, cookie extraction, and role-based access control

`javascript
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT from httpOnly cookie or Authorization header
 */
const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // Fallback to Bearer token in header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.'
      });
    }

    const secret = process.env.JWT_SECRET || 'dishasetu_super_secret_jwt_key_2026_student_portal';
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or corrupted authentication token.'
    });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: [${allowedRoles.join(', ')}]. Your role: [${req.user.role}].`
      });
    }

    next();
  };
};

const adminOnly = requireRole('admin');

module.exports = {
  verifyToken,
  protect: verifyToken,
  requireRole,
  adminOnly
};

`

---

## File: upload.js
- **Path:** /middleware/upload.js
- **Purpose:** Multer storage configuration separating private proofs and public banners

`javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Separate upload directories for Private Proofs (Non-Public) vs Public Banners
const privateProofDir = process.env.PRIVATE_PROOF_DIR || path.join(__dirname, '..', 'private_uploads', 'proofs');
const publicBannerDir = process.env.PUBLIC_BANNER_DIR || path.join(__dirname, '..', 'public', 'uploads', 'banners');

if (!fs.existsSync(privateProofDir)) {
  fs.mkdirSync(privateProofDir, { recursive: true });
}
if (!fs.existsSync(publicBannerDir)) {
  fs.mkdirSync(publicBannerDir, { recursive: true });
}

// Storage configuration with separated destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'proof' || file.fieldname === 'verificationImage') {
      cb(null, privateProofDir);
    } else {
      cb(null, publicBannerDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedBaseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${ext}). Only PDF documents, JPG, JPEG, PNG, and WEBP image proofs are accepted.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size limit
  }
});

const submissionUploads = upload.fields([
  { name: 'proof', maxCount: 1 },
  { name: 'verificationImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'publicBannerImage', maxCount: 1 }
]);

module.exports = upload;
module.exports.submissionUploads = submissionUploads;

`

---

## File: authRoutes.js
- **Path:** /routes/authRoutes.js
- **Purpose:** Authentication and profile management API routes

`javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public auth routes
router.post('/register', authController.registerUser);
router.post('/register-farmer', authController.registerFarmer);
router.post('/register-customer', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected user session routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;

`

---

## File: opportunityRoutes.js
- **Path:** /routes/opportunityRoutes.js
- **Purpose:** Opportunity CRUD and filtering API routes

`javascript
const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', opportunityController.getOpportunities);
router.get('/ticker', opportunityController.getLatestUpdatesTicker);
router.post('/check-eligibility', opportunityController.checkEligibility);
router.get('/:id', opportunityController.getOpportunityById);

// Protected Admin CRUD routes
router.post('/', protect, adminOnly, opportunityController.createOpportunity);
router.put('/:id', protect, adminOnly, opportunityController.updateOpportunity);
router.delete('/:id', protect, adminOnly, opportunityController.deleteOpportunity);

module.exports = router;

`

---

## File: schemeRoutes.js
- **Path:** /routes/schemeRoutes.js
- **Purpose:** Government scheme retrieval and management API routes

`javascript
const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);

// Protected Admin routes
router.post('/', protect, adminOnly, schemeController.createScheme);
router.put('/:id', protect, adminOnly, schemeController.updateScheme);
router.delete('/:id', protect, adminOnly, schemeController.deleteScheme);

module.exports = router;

`

---

## File: submissionRoutes.js
- **Path:** /routes/submissionRoutes.js
- **Purpose:** Student opportunity submission and admin review API routes

`javascript
const express = require('express');
const router = express.Router();
const { submissionUploads } = require('../middleware/upload');
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
  createSubmission,
  getMySubmissions,
  getAllSubmissionsAdmin,
  getSubmissionById,
  updateSubmissionStatusAdmin,
  getProofFile
} = require('../controllers/submissionController');

// All submission routes require authentication
router.use(verifyToken);

// Student submission endpoints
router.post('/', submissionUploads, createSubmission);
router.get('/my', getMySubmissions);

// Admin review endpoints
router.get('/admin', adminOnly, getAllSubmissionsAdmin);
router.put('/admin/:id/status', adminOnly, updateSubmissionStatusAdmin);
router.get('/proof/:filename', adminOnly, getProofFile);

// Single submission details
router.get('/:id', getSubmissionById);

module.exports = router;

`

---

## File: savedRoutes.js
- **Path:** /routes/savedRoutes.js
- **Purpose:** Saved opportunities and reminder scheduling API routes

`javascript
const express = require('express');
const router = express.Router();
const savedItemController = require('../controllers/savedItemController');
const { protect } = require('../middleware/auth');

router.post('/', protect, savedItemController.saveItem);
router.get('/', protect, savedItemController.getUserSavedItems);
router.put('/:id/reminder', protect, savedItemController.updateReminder);
router.delete('/:id', protect, savedItemController.removeSavedItem);

module.exports = router;

`

---

## File: notificationRoutes.js
- **Path:** /routes/notificationRoutes.js
- **Purpose:** In-app notification retrieval and read-status API routes

`javascript
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.put('/read-all', protect, notificationController.markAllRead);

module.exports = router;

`

---

## File: adminRoutes.js
- **Path:** /routes/adminRoutes.js
- **Purpose:** Admin analytics, statistics, and student management API routes

`javascript
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRegisteredStudents,
  deleteStudent
} = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Protect all admin routes with authentication & admin role check
router.use(verifyToken, adminOnly);

// Dashboard stats endpoint
router.get('/dashboard-stats', getDashboardStats);

// Student directory endpoints
router.get('/students', getRegisteredStudents);
router.delete('/students/:id', deleteStudent);

module.exports = router;

`

---

