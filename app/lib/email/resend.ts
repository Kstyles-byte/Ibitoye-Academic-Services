import { Resend } from 'resend';

// Get API key from environment variables with proper Expo prefix for client exposure
// For Expo, we need to use EXPO_PUBLIC_ prefix for client-accessible env vars
const API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY || 're_YpaEpyRN_AMSwqBjJtSdv5nqsZcSVrjWs';

// Initialize Resend with API key, ensuring we don't pass undefined
const resend = new Resend(API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Send an email using Resend
 * @param options Email configuration options
 * @returns A Promise that resolves when the email is sent
 */
export const sendEmail = async (options: EmailOptions) => {
  const { to, subject, text, html, from = 'Academic Lessons <no-reply@yourcompany.com>' } = options;

  try {
    // Log information for debugging
    console.log('Sending email with Resend:', { 
      hasApiKey: !!API_KEY, 
      apiKeyLength: API_KEY ? API_KEY.length : 0,
      to: Array.isArray(to) ? to : [to],
      subject
    });

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}; 