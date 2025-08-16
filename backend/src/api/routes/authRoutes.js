const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', requireAuth, authController.me);
router.put('/profile', requireAuth, authController.updateProfile);

module.exports = router;
