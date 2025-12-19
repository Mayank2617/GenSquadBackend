const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// Route to get list (with search & pagination)
// Example: /api/workflows?page=1&search=telegram
router.get('/', workflowController.getWorkflows);

// Route to get single workflow (with full JSON)
// Example: /api/workflows/65a...
router.get('/:id', workflowController.getWorkflowById);

// Route to trigger Sync manually
// Example: /api/workflows/sync
router.post('/sync', workflowController.syncWorkflows);

module.exports = router;