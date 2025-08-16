const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
};

module.exports = {
  generateToken,
  verifyToken
};