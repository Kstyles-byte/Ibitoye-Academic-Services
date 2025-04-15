type AdminNotificationProps = {
  clientName: string;
  requestTitle: string;
  requestId: string;
  academicLevel: string;
  deadline: string;
  adminDashboardUrl: string;
};

/**
 * Generates the HTML content for the notification email sent to admins
 */
export const getAdminNotificationEmailHtml = ({
  clientName,
  requestTitle,
  requestId,
  academicLevel,
  deadline,
  adminDashboardUrl,
}: AdminNotificationProps): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Service Request</title>
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
            <h1>New Service Request</h1>
          </div>
          <div class="content">
            <h2>New Request Alert</h2>
            <p>A new service request has been submitted and requires your review.</p>
            
            <div class="request-details">
              <p><strong>Client:</strong> ${clientName}</p>
              <p><strong>Request Title:</strong> ${requestTitle}</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Academic Level:</strong> ${academicLevel}</p>
              <p><strong>Deadline:</strong> ${deadline}</p>
            </div>
            
            <p>Please review this request and assign it to an appropriate expert.</p>
            
            <div style="text-align: center;">
              <a href="${adminDashboardUrl}" class="cta-button">Review Request</a>
            </div>
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
 * Generates the plain text content for the admin notification email
 */
export const getAdminNotificationEmailText = ({
  clientName,
  requestTitle,
  requestId,
  academicLevel,
  deadline,
  adminDashboardUrl,
}: AdminNotificationProps): string => {
  return `
NEW SERVICE REQUEST

A new service request has been submitted and requires your review.

Client: ${clientName}
Request Title: ${requestTitle}
Request ID: ${requestId}
Academic Level: ${academicLevel}
Deadline: ${deadline}

Please review this request and assign it to an appropriate expert.

Review Request: ${adminDashboardUrl}

© ${new Date().getFullYear()} Academic Lessons. All rights reserved.
  `;
}; 