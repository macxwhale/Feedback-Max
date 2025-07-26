
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { AuthService } = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async signUp(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await this.authService.signUp(email, password);
      
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email for verification.',
        user: result.data.user
      });
    } catch (error) {
      console.error('SignUp error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await this.authService.signIn(email, password);
      
      if (result.error) {
        return res.status(401).json({
          success: false,
          error: result.error.message
        });
      }

      // Generate JWT for service-to-service communication
      const token = jwt.sign(
        { 
          userId: result.data.user.id,
          email: result.data.user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        user: result.data.user,
        session: result.data.session,
        token
      });
    } catch (error) {
      console.error('SignIn error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async signOut(req, res) {
    try {
      const result = await this.authService.signOut();
      
      res.json({
        success: true,
        message: 'Signed out successfully'
      });
    } catch (error) {
      console.error('SignOut error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      const result = await this.authService.refreshSession(refreshToken);
      
      if (result.error) {
        return res.status(401).json({
          success: false,
          error: result.error.message
        });
      }

      res.json({
        success: true,
        session: result.data.session,
        user: result.data.user
      });
    } catch (error) {
      console.error('RefreshToken error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email } = req.body;
      
      const result = await this.authService.resetPassword(email);
      
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error.message
        });
      }

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('ResetPassword error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const { newPassword } = req.body;
      
      const result = await this.authService.updatePassword(newPassword);
      
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error.message
        });
      }

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('UpdatePassword error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await this.authService.getUserProfile(userId);
      
      res.json({
        success: true,
        profile
      });
    } catch (error) {
      console.error('GetProfile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updates = req.body;
      
      const profile = await this.authService.updateUserProfile(userId, updates);
      
      res.json({
        success: true,
        profile
      });
    } catch (error) {
      console.error('UpdateProfile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = { AuthController };
