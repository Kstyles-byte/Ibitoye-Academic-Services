import { sendEmail } from './resend';
import { getRequestConfirmationEmailHtml, getRequestConfirmationEmailText } from './templates/requestConfirmation';
import { getAdminNotificationEmailHtml, getAdminNotificationEmailText } from './templates/adminNotification';
import { getRequestApprovedEmailHtml, getRequestApprovedEmailText } from './templates/requestApproved';
import { ServiceRequest } from '../db/types';
import { formatDate } from '../utils/formatters';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourcompany.com';
const CLIENT_DASHBOARD_BASE_URL = process.env.VERCEL_URL ? 
  `https://${process.env.VERCEL_URL}` : 
  'http://localhost:3000';

const ADMIN_DASHBOARD_BASE_URL = `${CLIENT_DASHBOARD_BASE_URL}/(admin)/requests`;

/**
 * Send confirmation email to client after request submission
 */
export const sendRequestConfirmationEmail = async (
  serviceRequest: ServiceRequest,
  clientEmail: string,
  clientName: string
) => {
  try {
    const html = getRequestConfirmationEmailHtml({
      clientName,
      requestTitle: serviceRequest.subject,
      requestId: serviceRequest.id,
    });

    const text = getRequestConfirmationEmailText({
      clientName,
      requestTitle: serviceRequest.subject,
      requestId: serviceRequest.id,
    });

    await sendEmail({
      to: clientEmail,
      subject: 'Your Academic Lessons Request - Confirmation',
      html,
      text,
    });

    console.log(`Confirmation email sent to client: ${clientEmail}`);
  } catch (error) {
    console.error('Failed to send confirmation email to client:', error);
  }
};

/**
 * Send notification email to admin about new request
 */
export const sendAdminNotificationEmail = async (
  serviceRequest: ServiceRequest,
  clientName: string
) => {
  try {
    const deadline = formatDate(serviceRequest.deadline);
    
    // Create a unique URL to directly view this request
    const adminDashboardUrl = `${ADMIN_DASHBOARD_BASE_URL}?requestId=${serviceRequest.id}`;

    const html = getAdminNotificationEmailHtml({
      clientName,
      requestTitle: serviceRequest.subject,
      requestId: serviceRequest.id,
      academicLevel: serviceRequest.academicLevel,
      deadline,
      adminDashboardUrl,
    });

    const text = getAdminNotificationEmailText({
      clientName,
      requestTitle: serviceRequest.subject,
      requestId: serviceRequest.id,
      academicLevel: serviceRequest.academicLevel,
      deadline,
      adminDashboardUrl,
    });

    await sendEmail({
      to: DEFAULT_ADMIN_EMAIL,
      subject: `New Service Request: ${serviceRequest.subject}`,
      html,
      text,
    });

    console.log(`Notification email sent to admin: ${DEFAULT_ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Failed to send notification email to admin:', error);
  }
};

/**
 * Send approval notification email to client
 */
export const sendRequestApprovalEmail = async (
  serviceRequest: ServiceRequest,
  clientEmail: string,
  clientName: string
) => {
  try {
    // Create a URL to view the request in the client dashboard
    const clientDashboardUrl = `${CLIENT_DASHBOARD_BASE_URL}/(client)/dashboard`;

    const html = getRequestApprovedEmailHtml({
      clientName,
      requestTitle: serviceRequest.subject,
      requestId: serviceRequest.id,
      clientDashboardUrl,
    });

    const text = getRequestApprovedEmailText({
      clientName,
      requestTitle: serviceRequest.subject,
      requestId: serviceRequest.id,
      clientDashboardUrl,
    });

    await sendEmail({
      to: clientEmail,
      subject: 'Your Academic Lessons Request has been Approved!',
      html,
      text,
    });

    console.log(`Approval email sent to client: ${clientEmail}`);
  } catch (error) {
    console.error('Failed to send approval email to client:', error);
  }
}; 