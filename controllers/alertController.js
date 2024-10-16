import db from '../config/db.js';
import { generateAISuggestion } from '../services/openaiService.js';
import { getCMDBData } from './cmdbController.js';
import { getRecentIncidents } from '../services/csmsService.js';
import { getSOP } from '../services/sopService.js';  // Service to fetch SOP

// Helper function to extract hostname from expression
const extractHostnameFromExpression = (expression) => {
  const regex = /^([^\:]+)\:/;  // Match everything before the first colon
  const match = expression.match(regex);
  return match ? match[1] : null;
};

// Handle incoming alert from Zabbix
export const handleAlert = async (req, res) => {
  try {
    const { description, expression } = req.body;

    // Validate the incoming request
    if (!description || !expression) {
      return res.status(400).json({ message: 'Missing required fields: description or expression' });
    }

    console.log('Description:', description);
    console.log('Expression:', expression);

    // Extract hostname from expression
    const hostname = extractHostnameFromExpression(expression);
    if (!hostname) {
      return res.status(400).json({ message: 'Could not extract hostname from expression' });
    }

    // Fetch CMDB data from ServiceNow
    const cmdbInfo = await getCMDBData(hostname);
    if (!cmdbInfo) {
      console.log(`CMDB data not found for ${hostname}`);
    }

    // Fetch recent incidents by matching description (short_description in ServiceNow)
    const recentIncidents = await getRecentIncidents(description);

    // Fetch applicable SOP by matching meta field from kb_knowledge based on description
    const applicableSOP = await getSOP(description);  // Assuming getSOP uses "meta" field to find the SOP

    // If an SOP is found, store only the number and short_description
    let sopInfo = {};
    let sopText = '';
    if (applicableSOP) {
      sopInfo = {
        number: applicableSOP.number,
        short_description: applicableSOP.short_description,
      };
      sopText = applicableSOP.text;
    }

    // Generate a suggestion using OpenAI, passing only the SOP text and other alert data
    const suggestion = await generateAISuggestion(req.body, cmdbInfo, recentIncidents, sopText);

    // Insert the alert into the database
    const insertQuery = `
      INSERT INTO alerts (hostname, description, expression, cmdb_info, recent_incidents, sop_info, suggestion)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [
      hostname,
      description,
      expression,
      JSON.stringify(cmdbInfo),
      JSON.stringify(recentIncidents),
      JSON.stringify(sopInfo),  // Store only SOP number and short_description
      suggestion,
    ];

    const result = await db.query(insertQuery, values);
    const alertId = result.rows[0].id;

    // Respond with the alert ID and generated suggestion
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
