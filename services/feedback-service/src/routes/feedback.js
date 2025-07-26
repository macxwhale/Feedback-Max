
const express = require('express');
const { FeedbackController } = require('../controllers/FeedbackController');
const { authenticateToken } = require('../middleware/auth');
const { validateFeedbackSession, validateFeedbackResponse, validateQuestion } = require('../middleware/validation');

const router = express.Router();
const feedbackController = new FeedbackController();

// Public routes (for feedback collection)
router.get('/questions', feedbackController.getQuestions.bind(feedbackController));
router.post('/sessions', validateFeedbackSession, feedbackController.createFeedbackSession.bind(feedbackController));
router.get('/sessions/:id', feedbackController.getFeedbackSession.bind(feedbackController));
router.put('/sessions/:id', feedbackController.updateFeedbackSession.bind(feedbackController));
router.post('/responses', validateFeedbackResponse, feedbackController.createFeedbackResponse.bind(feedbackController));
router.get('/responses', feedbackController.getFeedbackResponses.bind(feedbackController));

// Protected routes (for admin management)
router.use(authenticateToken);

// Question management
router.post('/questions', validateQuestion, feedbackController.createQuestion.bind(feedbackController));
router.put('/questions/:id', feedbackController.updateQuestion.bind(feedbackController));
router.delete('/questions/:id', feedbackController.deleteQuestion.bind(feedbackController));

module.exports = router;
