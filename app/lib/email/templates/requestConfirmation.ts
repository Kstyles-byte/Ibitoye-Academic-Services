type RequestConfirmationProps = {
  clientName: string;
  requestTitle: string;
  requestId: string;
};

/**
 * Generates the HTML content for the request confirmation email sent to clients
 */
export const getRequestConfirmationEmailHtml = ({
  clientName,
  requestTitle,
  requestId,
}: RequestConfirmationProps): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Confirmation</title>
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${clientName},</h2>
            <p>Thank you for submitting your request with Academic Lessons. Your request has been received and is being reviewed by our administrative team.</p>
            
            <div class="request-details">
              <p><strong>Request Title:</strong> ${requestTitle}</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Status:</strong> Pending Review</p>
            </div>
            
            <p>Once approved, you will receive another email notification and an expert will contact you on WhatsApp to discuss further details.</p>
            
            <p>If you have any questions, please feel free to reply to this email.</p>
            
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
 * Generates the plain text content for the request confirmation email
 */
export const getRequestConfirmationEmailText = ({
  clientName,
  requestTitle,
  requestId,
}: RequestConfirmationProps): string => {
  return `
Hello ${clientName},

Thank you for submitting your request with Academic Lessons. Your request has been received and is being reviewed by our administrative team.

Request Title: ${requestTitle}
Request ID: ${requestId}
Status: Pending Review

Once approved, you will receive another email notification and an expert will contact you on WhatsApp to discuss further details.

If you have any questions, please feel free to reply to this email.

Best regards,
Academic Lessons Team

© ${new Date().getFullYear()} Academic Lessons. All rights reserved.
  `;
}; 