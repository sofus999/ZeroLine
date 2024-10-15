import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ServiceNow instance details
const serviceNowInstance = process.env.SERVICENOW_INSTANCE;
const apiKey = process.env.SERVICENOW_API_KEY;

// Function to fetch recent incidents for a hostname from ServiceNow
export const getRecentIncidents = async (hostname) => {
  try {
    // Modify the query to match your ServiceNow incident table structure
    const url = `${serviceNowInstance}/api/now/table/incident?sysparm_query=cmdb_ci.name=${hostname}&sysparm_limit=5`;

    // Make GET request to ServiceNow using basic authentication
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (response.data.result.length === 0) {
      console.log(`No incidents found for ${hostname}`);
      return [];
    }

    return response.data.result.map((incident) => ({
      number: incident.number,
      short_description: incident.short_description,
      state: incident.state,
      resolved_at: incident.resolved_at,
    }));
  } catch (error) {
    console.error('Error fetching incidents from ServiceNow:', error);
    return null;  // Return null if there was an error fetching incidents
  }
};
