import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ServiceNow instance details
const serviceNowInstance = process.env.SERVICENOW_INSTANCE;
const apiKey = process.env.SERVICENOW_API_KEY;

// Function to fetch recent incidents for a hostname from ServiceNow
export const getRecentIncidents = async (hostname) => {
  try {
    // Get the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const formattedDate = sevenDaysAgo.toISOString().split('T')[0];  // Get only date part in 'YYYY-MM-DD' format

    // Query ServiceNow for incidents related to this hostname in the last 7 days
    const response = await axios.get(`${serviceNowInstance}/api/now/table/incident`, {
      params: {
        sysparm_query: `sys_created_on>=${formattedDate}^cmdb_ci.name=${hostname}`,
        sysparm_fields: 'number,short_description,close_notes',  // Only fetch relevant fields
        sysparm_limit: 10,  // Limit to avoid pulling too many
      },
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const incidents = response.data.result;

    // Return incidents with only the needed fields
    return incidents.map((incident) => ({
      number: incident.number,
      short_description: incident.short_description,
      close_notes: incident.close_notes || 'No close notes available',
    }));
  } catch (error) {
    console.error('Error fetching incidents from ServiceNow:', error);
    return [];  // Return empty if no incidents are found or an error occurs
  }
};
