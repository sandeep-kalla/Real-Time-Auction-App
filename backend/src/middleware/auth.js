const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to verify JWT token and attach user to request
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    // Note: In a production environment with Supabase Auth, you would verify
    // the token using Supabase's JWK (JSON Web Key) endpoint
    // For simplicity, we're using a basic JWT verification here
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Find user in database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user' });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};