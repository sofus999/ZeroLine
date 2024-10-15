import express from 'express';
import { handleAlert, getAlerts, submitFeedback } from '../controllers/alertController.js';

const router = express.Router();

// POST: Receive alert (from Zabbix)
router.post('/', handleAlert);

// GET: Fetch all alerts (for the dashboard)
router.get('/', getAlerts);

// POST: Submit feedback for a specific alert
router.post('/:id/feedback', submitFeedback);

export default router;
