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

    const secret = process.env.JWT_SECRET || 'kisan_direct_super_secret_jwt_key_2026_agro_market';
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
 * @param  {...string} allowedRoles - e.g. 'farmer', 'customer', 'admin'
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

module.exports = {
  verifyToken,
  requireRole
};
