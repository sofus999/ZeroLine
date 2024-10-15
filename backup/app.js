// app.js

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Express application
const app = express();

// Set up the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set the port
const PORT = process.env.PORT || 3000;

// Since __dirname is not defined in ESM, we need to get it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for alerts and suggestions
let alertsList = [];

// Dummy data for CMDB and incidents
const cmdbData = {
  'server1.example.com': {
    os: 'Windows Server',
    ip: '192.168.1.10',
    owner: 'Team A',
  },
  'server2.example.com': {
    os: 'Windows Server',
    ip: '192.168.1.11',
    owner: 'Team B',
  },
  // Add more entries as needed
};

const incidentsData = [
  {
    hostname: 'server1.example.com',
    incident: 'Disk space alert',
    timestamp: '2024-09-25 10:00:00',
  },
  {
    hostname: 'server1.example.com',
    incident: 'CPU usage high',
    timestamp: '2024-09-26 14:30:00',
  },
  {
    hostname: 'server2.example.com',
    incident: 'Service failure',
    timestamp: '2024-09-24 09:15:00',
  },
  // Add more incidents as needed
];

// Function to retrieve relevant data based on hostname
function getRelevantData(hostname) {
  const cmdbInfo = cmdbData[hostname] || {};
  const recentIncidents = incidentsData.filter(
    (incident) => incident.hostname === hostname
  );
  return { cmdbInfo, recentIncidents };
}

// Function to generate AI suggestion using OpenAI
async function generateAISuggestion(alertData, cmdbInfo, recentIncidents) {
  const systemPrompt = `You are an AI assistant that helps troubleshoot IT alerts by providing recommended resolutions based on alert details, CMDB information, and recent incidents.`;

  const userMessage = `
Alert Details:
Hostname: ${alertData.hostname}
Alert Type: ${alertData.alert_type}
Error Message: ${alertData.error_message}

CMDB Information:
${JSON.stringify(cmdbInfo)}

Recent Incidents:
${JSON.stringify(recentIncidents)}

Based on the information above, provide a recommended resolution.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const suggestion = response.choices[0].message.content.trim();
    return suggestion;
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    return 'Unable to generate suggestion at this time.';
  }
}


// Route to receive alerts from the monitoring system
app.post('/receive_alert', async (req, res) => {
  const alertData = req.body;
  const hostname = alertData.hostname;
  const { cmdbInfo, recentIncidents } = getRelevantData(hostname);
  const suggestion = await generateAISuggestion(
    alertData,
    cmdbInfo,
    recentIncidents
  );
  // Assign an ID to the alert
  const alertId = alertsList.length + 1;
  const alert = {
    id: alertId,
    hostname: hostname,
    alert_type: alertData.alert_type,
    error_message: alertData.error_message,
    suggestion: suggestion,
  };
  alertsList.push(alert);
  res.json({ status: 'alert received' });
});

// Route to display the dashboard
app.get('/', (req, res) => {
  res.render('dashboard', { alerts: alertsList });
});

// Route to handle feedback submission
app.post('/submit_feedback', (req, res) => {
  const alertId = parseInt(req.body.alert_id);
  const feedback = req.body.feedback;
  // Find the alert and update with feedback
  const alert = alertsList.find((a) => a.id === alertId);
  if (alert) {
    alert.feedback = feedback;
    res.json({ status: 'feedback received' });
  } else {
    res.status(404).json({ status: 'alert not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});