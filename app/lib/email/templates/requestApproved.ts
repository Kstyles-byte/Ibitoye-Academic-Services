type RequestApprovedProps = {
  clientName: string;
  requestTitle: string;
  requestId: string;
  clientDashboardUrl: string;
};

/**
 * Generates the HTML content for the request approval email sent to clients
 */
export const getRequestApprovedEmailHtml = ({
  clientName,
  requestTitle,
  requestId,
  clientDashboardUrl,
}: RequestApprovedProps): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Approved</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2563eb;
            padding: 20px;
            text-align: center;
            color: white;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 0 0 5px 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.8rem;
            color: #6b7280;
          }
          h1 {
            color: #ffffff;
            margin: 0;
          }
          h2 {
            color: #1e40af;
          }
          .request-details {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .status-approved {
            color: #047857;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Approved</h1>
          </div>
          <div class="content">
            <h2>Good News, ${clientName}!</h2>
            <p>Your service request has been <span class="status-approved">approved</span>!</p>
            
            <div class="request-details">
              <p><strong>Request Title:</strong> ${requestTitle}</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Status:</strong> <span class="status-approved">Approved</span></p>
            </div>
            
            <p>One of our experts will contact you soon via WhatsApp to discuss your request in detail.</p>
            <p>Be prepared to share additional information that may be needed to fulfill your request.</p>
            
            <div style="text-align: center;">
              <a href="${clientDashboardUrl}" class="cta-button">View Request</a>
            </div>
            
            <p>Thank you for choosing Academic Lessons!</p>
            
            <p>Best regards,<br>Academic Lessons Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Academic Lessons. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generates the plain text content for the request approval email
 */
export const getRequestApprovedEmailText = ({
  clientName,
  requestTitle,
  requestId,
  clientDashboardUrl,
}: RequestApprovedProps): string => {
  return `
GOOD NEWS, ${clientName}!

Your service request has been APPROVED!

Request Title: ${requestTitle}
Request ID: ${requestId}
Status: Approved

One of our experts will contact you soon via WhatsApp to discuss your request in detail.
Be prepared to share additional information that may be needed to fulfill your request.

View Request: ${clientDashboardUrl}

Thank you for choosing Academic Lessons!

Best regards,
Academic Lessons Team

© ${new Date().getFullYear()} Academic Lessons. All rights reserved.
  `;
}; 