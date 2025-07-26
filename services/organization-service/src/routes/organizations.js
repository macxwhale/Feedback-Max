
const express = require('express');
const { OrganizationController } = require('../controllers/OrganizationController');
const { authenticateToken } = require('../middleware/auth');
const { validateOrganization, validateOrganizationUpdate } = require('../middleware/validation');

const router = express.Router();
const organizationController = new OrganizationController();

// Public routes
router.get('/config/:slug', organizationController.getOrganizationConfig.bind(organizationController));
router.get('/slug/:slug', organizationController.getOrganizationBySlug.bind(organizationController));

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// Organization CRUD
router.get('/', organizationController.getAllOrganizations.bind(organizationController));
router.get('/:id', organizationController.getOrganizationById.bind(organizationController));
router.post('/', validateOrganization, organizationController.createOrganization.bind(organizationController));
router.put('/:id', validateOrganizationUpdate, organizationController.updateOrganization.bind(organizationController));

// Organization analytics and members
router.get('/:id/stats', organizationController.getOrganizationStats.bind(organizationController));
router.get('/:id/members', organizationController.getOrganizationMembers.bind(organizationController));

module.exports = router;
