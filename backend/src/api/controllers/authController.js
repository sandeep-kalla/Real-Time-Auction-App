const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
};

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { email, password, name, role = 'buyer' } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Email, password, and name are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: ['buyer', 'seller', 'admin'].includes(role) ? role : 'buyer'
      });

      // Generate token
      const token = generateToken(user);

      // Return user without password
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Generate token
      const token = generateToken(user);

      // Return user without password
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };

      res.json({
        message: 'Login successful',
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  },

  // Get current user profile
  me: async (req, res) => {
    try {
      const user = req.user; // Set by auth middleware

      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };

      res.json({
        user: userResponse
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, role } = req.body;
      const userId = req.user.id;

      // Build update object
      const updateData = {};
      if (name) updateData.name = name;
      if (role && ['buyer', 'seller', 'admin'].includes(role)) {
        updateData.role = role;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: 'No valid fields to update'
        });
      }

      // Update user
      await User.update(updateData, {
        where: { id: userId }
      });

      // Get updated user
      const updatedUser = await User.findByPk(userId);

      const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      };

      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
};

module.exports = authController;
