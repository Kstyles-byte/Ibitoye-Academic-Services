// Import nodemailer only on the server side
const nodemailer = require('nodemailer');

// Email templates
const EMAIL_TEMPLATES = {
  // Template for client when request is submitted
  CLIENT_REQUEST_SUBMITTED: (clientName, requestTitle) => ({
    subject: 'Academic Lessons: Your Request Has Been Submitted',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Request Received</h2>
        <p>Hello ${clientName},</p>
        <p>Thank you for submitting your request <strong>"${requestTitle}"</strong> to Academic Lessons.</p>
        <p>Your request has been received and is currently pending review. Our team will review your request shortly.</p>
        <p>Once your request is approved, an expert will be assigned to assist you, and you will be notified via email.</p>
        <p>If you have any questions, please feel free to contact us.</p>
        <p>Best regards,<br>Academic Lessons Team</p>
      </div>
    `
  }),

  // Template for admin when a new request is submitted
  ADMIN_NEW_REQUEST: (clientName, requestTitle) => ({
    subject: 'Academic Lessons: New Service Request',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">New Service Request</h2>
        <p>A new service request has been submitted to Academic Lessons.</p>
        <p><strong>Request Title:</strong> ${requestTitle}</p>
        <p><strong>Client:</strong> ${clientName}</p>
        <p>Please log in to the admin dashboard to review and approve this request.</p>
        <p>Best regards,<br>Academic Lessons System</p>
      </div>
    `
  }),

  // Template for client when request is approved
  CLIENT_REQUEST_APPROVED: (clientName, requestTitle) => ({
    subject: 'Academic Lessons: Your Request Has Been Approved',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Request Approved</h2>
        <p>Hello ${clientName},</p>
        <p>Great news! Your request <strong>"${requestTitle}"</strong> has been approved.</p>
        <p>An expert will contact you shortly on WhatsApp to discuss your requirements in more detail.</p>
        <p>You can check the status of your request anytime by logging into your account.</p>
        <p>Thank you for choosing Academic Lessons.</p>
        <p>Best regards,<br>Academic Lessons Team</p>
      </div>
    `
  })
};

/**
 * Create a transporter object using the default SMTP transport
 * This function creates a new transporter for each email to prevent connection issues
 */
const createTransporter = async () => {
  // Configure transporter using environment variables
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };
  
  console.log('Email configuration:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user ? config.auth.user.substring(0, 3) + '***' : '(not set)',
    pass: config.auth.pass ? '********' : '(not set)'
  });
  
  return nodemailer.createTransport(config);
};

/**
 * Send an email
 */
const sendEmail = async (to, subject, html) => {
  try {
    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
    const transporter = await createTransporter();
    
    const result = await transporter.sendMail({
      from: `"Academic Lessons" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log(`Email sent successfully to ${to}. Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper for CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
};

/**
 * This is a Vercel serverless function that handles email sending
 * It runs in a Node.js environment on the server, not in the browser or React Native
 */
module.exports = async (req, res) => {
  console.log('Email API route called with method:', req.method);
  
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle Vercel's body parsing
    let body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        body = req.body;
      }
    } else {
      body = req.body;
    }
    
    console.log('Email API request body:', body);
    
    // Validate required fields
    if (!body || !body.clientEmail || !body.clientName || !body.requestTitle || !body.type) {
      console.error('Missing required fields in email request:', body);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Process different email types
    switch (body.type) {
      case 'request-submitted':
        // Send email to client
        await sendEmail(
          body.clientEmail,
          EMAIL_TEMPLATES.CLIENT_REQUEST_SUBMITTED(body.clientName, body.requestTitle).subject,
          EMAIL_TEMPLATES.CLIENT_REQUEST_SUBMITTED(body.clientName, body.requestTitle).body
        );
        
        // Send email to admin if adminEmail is provided
        if (body.adminEmail) {
          await sendEmail(
            body.adminEmail,
            EMAIL_TEMPLATES.ADMIN_NEW_REQUEST(body.clientName, body.requestTitle).subject,
            EMAIL_TEMPLATES.ADMIN_NEW_REQUEST(body.clientName, body.requestTitle).body
          );
        }
        break;
        
      case 'request-approved':
        // Send approval email to client
        await sendEmail(
          body.clientEmail,
          EMAIL_TEMPLATES.CLIENT_REQUEST_APPROVED(body.clientName, body.requestTitle).subject,
          EMAIL_TEMPLATES.CLIENT_REQUEST_APPROVED(body.clientName, body.requestTitle).body
        );
        break;
        
      default:
        console.error(`Invalid email type: ${body.type}`);
        return res.status(400).json({ error: 'Invalid email type' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 