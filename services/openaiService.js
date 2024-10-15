import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Ensure your API key is loaded from .env
});

export const generateAISuggestion = async (alertData, cmdbInfo, recentIncidents) => {
  const systemPrompt = `You are an AI assistant specializing in troubleshooting IT infrastructure alerts. Use the provided information to generate a specific and accurate resolution tailored to the Operating System of the affected host. Focus on solutions only relevant to the detected OS.`;

  // Determine the OS type for context
  const osType = cmdbInfo?.os?.toLowerCase().includes("windows") ? "Windows" : "Linux/Mac";

  const userMessage = `
  Alert Details:
  - Hostname: ${alertData.hostname}
  - Alert Type: ${alertData.alert_type}
  - Error Message: ${alertData.error_message}

  CMDB Information (Configuration Management Database):
  - Operating System: ${cmdbInfo?.os || 'Unknown'}
  - IP Address: ${cmdbInfo?.ip_address || 'Unknown'}
  - Owner: ${cmdbInfo?.assigned_to || 'Unknown'}

  Recent Incidents:
  - ${recentIncidents && recentIncidents.length > 0 ? JSON.stringify(recentIncidents) : 'No recent incidents recorded.'}

  Based on the alert details, the CMDB information, and the history of incidents, generate a resolution specifically for ${osType} systems.
  Only provide solutions relevant to the detected OS.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // or a more advanced model you are using
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,  // Increased max tokens for more detailed responses
      temperature: 0.7,  // Balance creativity and reliability
    });

    const suggestion = response.choices[0].message.content.trim();
    return suggestion;
  } catch (error) {
    console.error('Error generating AI suggestion:', error);

    // Default fallback suggestion if OpenAI API fails
    return 'Unable to generate suggestion at this time. Please check network status or try again later.';
  }
};
