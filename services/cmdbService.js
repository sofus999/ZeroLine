import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const serviceNowInstance = process.env.SERVICENOW_INSTANCE;  // URL for ServiceNow instance
const apiKey = process.env.SERVICENOW_API_KEY;  // API key from .env file

/**
 * Function to get CMDB data from ServiceNow based on the hostname
 * @param {string} hostname - The hostname to query for CMDB data
 * @returns {object} - Full CMDB data including manufacturer and model information
 */
export const getCMDBDataFromServiceNow = async (hostname) => {
  try {
    // Step 1: Query the parent "cmdb_ci" table to get basic info and sys_class_name
    const parentResponse = await axios.get(
      `${serviceNowInstance}/api/now/table/cmdb_ci`,
      {
        params: {
          name: hostname,
        },
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the sys_class_name and other basic details from the response
    const parentData = parentResponse.data.result[0];
    if (!parentData) {
      throw new Error(`No CMDB data found for hostname: ${hostname}`);
    }

    const { sys_class_name, sys_id } = parentData;

    // Step 2: Use sys_class_name to query the specific child CMDB table (e.g., cmdb_ci_server)
    const childResponse = await axios.get(
      `${serviceNowInstance}/api/now/table/${sys_class_name}`,
      {
        params: {
          sys_id: sys_id,
        },
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Get the full CMDB data from the child table
    const fullCMDBData = childResponse.data.result[0];
    if (!fullCMDBData) {
      throw new Error(`No detailed CMDB data found in table ${sys_class_name} for sys_id: ${sys_id}`);
    }

    return fullCMDBData;  // Return the full CMDB data
  } catch (error) {
    console.error('Error fetching CMDB data from ServiceNow:', error);
    return null;  // Return null if an error occurs
  }
};
