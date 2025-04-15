// Import the Resend library
const { Resend } = require('resend');

// Create instance with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Templates for emails
const getRequestConfirmationHtml = ({ clientName, requestTitle, requestId }) => {
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

const getAdminNotificationHtml = ({ clientName, requestTitle, requestId, academicLevel, deadline, adminDashboardUrl }) => {
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

const getRequestApprovedHtml = ({ clientName, requestTitle, requestId, clientDashboardUrl }) => {
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

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get parameters from request body
  const { 
    emailType, 
    to, 
    clientName, 
    requestTitle, 
    requestId, 
    academicLevel, 
    deadline, 
    clientDashboardUrl, 
    adminDashboardUrl 
  } = req.body;

  // Default from address
  const from = 'Academic Lessons <no-reply@resend.dev>';

  // Set proper CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    let subject, html;
    
    // Generate email content based on type
    switch (emailType) {
      case 'requestConfirmation':
        subject = 'Your Academic Lessons Request - Confirmation';
        html = getRequestConfirmationHtml({ clientName, requestTitle, requestId });
        break;
      
      case 'adminNotification':
        subject = `New Service Request: ${requestTitle}`;
        html = getAdminNotificationHtml({ 
          clientName, 
          requestTitle, 
          requestId, 
          academicLevel, 
          deadline, 
          adminDashboardUrl 
        });
        break;
      
      case 'requestApproved':
        subject = 'Your Academic Lessons Request has been Approved!';
        html = getRequestApprovedHtml({ 
          clientName, 
          requestTitle, 
          requestId, 
          clientDashboardUrl 
        });
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }
    
    // Send email
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return res.status(400).json({ error: error.message });
    }
    
    // Return success response
    return res.status(200).json({ 
      message: 'Email sent successfully', 
      data 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
}; 