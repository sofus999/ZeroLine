import { getCMDBDataFromServiceNow } from '../services/cmdbService.js';

/**
 * Function to preprocess CMDB data and extract relevant fields.
 * Modify it to suit your needs.
 */
export function preprocessCMDBData(rawCMDBData) {
  return {
    name: rawCMDBData.name || 'N/A',
    serial_number: rawCMDBData.serial_number || 'N/A',
    ip_address: rawCMDBData.ip_address || 'N/A',
    sys_class_name: rawCMDBData.sys_class_name || 'N/A',
    assigned_to: rawCMDBData.assigned_to?.display_value || 'N/A',  // Ensure readable value
    os: rawCMDBData.os || 'N/A',
    manufacturer: rawCMDBData.manufacturer?.display_value || 'N/A',  // Ensure readable value
    model: rawCMDBData.model_id?.display_value || 'N/A',  // Ensure readable value
    last_discovered: rawCMDBData.last_discovered || 'N/A',
    fqdn: rawCMDBData.fqdn || 'N/A',
  };
}

/**
 * Main function to handle fetching and processing CMDB data
 * @param {string} hostname - Hostname to query the CMDB
 * @returns {object} - Processed CMDB data
 */
export const getCMDBData = async (hostname) => {
  try {
    // Fetch full CMDB data from ServiceNow via service function
    const rawCMDBData = await getCMDBDataFromServiceNow(hostname);
    if (!rawCMDBData) {
      throw new Error('No CMDB data found');
    }

    // Preprocess CMDB data to extract only relevant fields
    const processedCMDBData = preprocessCMDBData(rawCMDBData);
    return processedCMDBData;
  } catch (error) {
    console.error('Error fetching CMDB data:', error);
    return null;  // Return null if any error occurs
  }
};
