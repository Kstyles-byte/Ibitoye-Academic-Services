/**
 * API client for sending email notifications
 * This client-side code only handles API calls and has no server-side dependencies
 */

// Email notification types
export type EmailType = 'request-submitted' | 'request-approved';

// Interface for email notification request
export interface EmailNotificationRequest {
  type: EmailType;
  clientEmail: string;
  clientName: string;
  requestTitle: string;
  adminEmail?: string;
}

/**
 * Send an email notification through the API
 * @param data Email notification data
 * @returns Promise that resolves when API call is complete
 */
export const sendEmailNotification = async (data: EmailNotificationRequest): Promise<void> => {
  try {
    // Get the current environment
    const isDevelopment = 
      typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
    
    // Determine the base URL based on environment
    let baseUrl: string;
    
    if (typeof window !== 'undefined') {
      // Browser environment
      baseUrl = window.location.origin;
    } else {
      // Fallback for other environments
      baseUrl = 'http://localhost:3000';
    }
    
    console.log(`Sending email notification to ${baseUrl}/api/email`);
    
    // Make API call to email endpoint
    const response = await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email API error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to send email notification');
      } catch (e) {
        throw new Error(`Failed to send email notification: ${errorText}`);
      }
    }
    
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Gracefully handle email failures - don't throw the error so the application can continue
  }
}; 