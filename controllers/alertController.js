import db from '../config/db.js';  // Assuming the DB connection is set up in config/db.js
import { generateAISuggestion } from '../services/openaiService.js';
import { getCMDBData } from './cmdbController.js';
import { getRecentIncidents } from '../services/csmsService.js';

// Handle incoming alert (from Zabbix)
export const handleAlert = async (req, res) => {
  try {
    const { hostname, alert_type, error_message } = req.body;

    // Validate the incoming request
    if (!hostname || !alert_type || !error_message) {
      return res.status(400).json({ message: 'Missing required fields: hostname, alert_type, or error_message' });
    }

    console.log('Hostname:', hostname);  // Log hostname for debugging

    // Fetch CMDB data from ServiceNow
    const cmdbInfo = await getCMDBData(hostname);

    if (!cmdbInfo) {
      console.log(`CMDB data not found for ${hostname}`);
    }

    // Fetch recent incidents based on the 7-day criteria
    const recentIncidents = await getRecentIncidents(hostname);

    // Generate AI suggestion based on the alert, CMDB info, and incidents
    const suggestion = await generateAISuggestion(req.body, cmdbInfo, recentIncidents);

    // Insert the alert into the database
    const insertQuery = `
      INSERT INTO alerts (hostname, alert_type, error_message, cmdb_info, recent_incidents, suggestion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const values = [
      hostname,
      alert_type,
      error_message,
      JSON.stringify(cmdbInfo),         // Store CMDB info in JSON format
      JSON.stringify(recentIncidents),  // Store incidents in JSON format
      suggestion,
    ];

    const result = await db.query(insertQuery, values);
    const alertId = result.rows[0].id;

    // Respond with the alert ID and suggestion
    res.status(201).json({ message: 'Alert processed', alertId, suggestion });
  } catch (error) {
    console.error('Error handling alert:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch all alerts (for the dashboard)
export const getAlerts = async (req, res) => {
  try {
    const query = 'SELECT * FROM alerts ORDER BY created_at DESC';
    const result = await db.query(query);
    res.json(result.rows);  // Return the alerts from the database
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Submit feedback for a specific alert
export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ message: 'Feedback is required' });
    }

    // Update the feedback in the database
    const updateQuery = `
      UPDATE alerts
      SET feedback = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [feedback, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Feedback submitted', alert: result.rows[0] });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
