import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Ensure your API key is loaded from .env
});

export const generateAISuggestion = async (alertData, cmdbInfo, recentIncidents) => {
  const systemPrompt = `You are an AI assistant that helps IT engineers troubleshoot infrastructure alerts in a Managed Service Provider's (MSP) Operations Center. Your task is to provide detailed, step-by-step troubleshooting steps based on the alert details, the operating system, and past incidents. Prioritize the most efficient solution for reducing downtime and minimizing manual intervention. Focus on specific actions relevant to the provided operating system and infrastructure type. Avoid generic solutions—be precise and assume the engineer is familiar with basic troubleshooting tools.`;

  // Determine the OS type for context
  const osType = cmdbInfo?.os?.toLowerCase().includes("windows") ? "Windows" : "Linux/Mac";

  const userMessage = `
  Alert Details:
  - Hostname: ${alertData.hostname}
  - OS: ${cmdbInfo?.os || 'Unknown'}
  - Alert Type: ${alertData.alert_type}
  - Error Message: ${alertData.error_message}

  CMDB Information:
  - Operating System: ${cmdbInfo?.os || 'Unknown'}
  - IP Address: ${cmdbInfo?.ip_address || 'Unknown'}
  - Owner: ${cmdbInfo?.assigned_to || 'Unknown'}

  Recent Incidents:
  - ${recentIncidents && recentIncidents.length > 0 ? JSON.stringify(recentIncidents) : 'No recent incidents recorded.'}

  Based on this information, generate a resolution specifically for ${osType} systems. Provide only OS-specific solutions and steps to resolve the issue.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,  // Adjust as needed based on prompt length
      temperature: 0.7,  // Adjust for creativity
    });

    const suggestion = response.choices[0].message.content.trim();
    return suggestion;
  } catch (error) {
    console.error('Error generating AI suggestion:', error);

    // Default fallback suggestion if OpenAI API fails
    return 'Unable to generate suggestion at this time. Please check network status or try again later.';
  }
};