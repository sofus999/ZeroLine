import { generateAISuggestion } from '../services/openaiService.js';
import { getCMDBData } from './cmdbController.js';
import { getRecentIncidents } from '../services/csmsService.js'; 

let alerts = [];  // In-memory store for alerts (replace with DB in production)

export const handleAlert = async (req, res) => {
  try {
    console.log('Incoming request body:', req.body);  // Log the request body

    const { hostname } = req.body;

    console.log('Hostname:', hostname);  // Log hostname for debugging

    // Fetch CMDB data
    const cmdbInfo = await getCMDBData(hostname);

    if (!hostname) {
      return res.status(400).json({ message: 'Hostname is missing in the request body' });
    }

    // Attempt to fetch recent incidents (optional)
    const recentIncidents = await getRecentIncidents(hostname);

    // Generate AI suggestion based on the alert, CMDB info, and incidents
    const suggestion = await generateAISuggestion(req.body, cmdbInfo, recentIncidents);

    // Create the alert object
    const alertData = {
      id: alerts.length + 1,  // Temporary in-memory ID
      hostname: req.body.hostname,
      alert_type: req.body.alert_type,
      error_message: req.body.error_message,
      cmdb_info: cmdbInfo || 'No CMDB data available',
      recent_incidents: recentIncidents || 'No recent incidents recorded',
      suggestion: suggestion,
      feedback: null  // No feedback yet
    };

    // Store the alert in-memory (replace with DB for production)
    alerts.push(alertData);

    // Return the alert with the AI suggestion
    res.status(201).json({ message: 'Alert received', alert: alertData });
  } catch (error) {
    console.error('Error handling alert:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  
};

// Fetch all alerts (for the dashboard)
export const getAlerts = (req, res) => {
  try {
    res.json(alerts);  // Return the in-memory list of alerts
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Submit feedback for a specific alert
export const submitFeedback = (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    // Find the alert by ID
    const alert = alerts.find((a) => a.id === parseInt(id));

    if (alert) {
      // Update the alert with the feedback
      alert.feedback = feedback;
      res.json({ message: 'Feedback received', alert });
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};
