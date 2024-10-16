import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const serviceNowInstance = process.env.SERVICENOW_INSTANCE;
const apiKey = process.env.SERVICENOW_API_KEY;

// Fetch SOP based on the description (meta field in kb_knowledge)
export const getSOP = async (description) => {
  try {
    const response = await axios.get(
      `${serviceNowInstance}/api/now/table/kb_knowledge`,
      {
        params: {
          sysparm_query: `GOTO123TEXTQUERY321=${description}`,
          sysparm_limit: 1  // Limit to the most relevant result
        },
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if there are any results
    if (response.data.result.length === 0) {
      console.log('No SOP found matching the description');
      return null;
    }

    // Return the most relevant SOP (first result)
    return response.data.result[0];
  } catch (error) {
    console.error('Error fetching SOP from ServiceNow:', error);
    return null;
  }
};
