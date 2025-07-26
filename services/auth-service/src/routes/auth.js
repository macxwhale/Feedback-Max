
const express = require('express');
const { AuthController } = require('../controllers/AuthController');
const { validateSignUp, validateSignIn } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const authController = new AuthController();

// Authentication routes
router.post('/signup', validateSignUp, authController.signUp.bind(authController));
router.post('/signin', validateSignIn, authController.signIn.bind(authController));
router.post('/signout', authenticateToken, authController.signOut.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.post('/update-password', authenticateToken, authController.updatePassword.bind(authController));

// User profile routes
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

module.exports = router;
