/**
 * Simple test API endpoint to verify the serverless function infrastructure
 */
module.exports = (req, res) => {
  // Check if environment variables are available
  const envVars = {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
    SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not set',
    SMTP_PORT: process.env.SMTP_PORT ? 'Set' : 'Not set',
    SMTP_SECURE: process.env.SMTP_SECURE ? 'Set' : 'Not set',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set'
  };

  // Return basic information
  res.status(200).json({
    message: 'Hello from Vercel Serverless Function!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    environmentVariables: envVars
  });
}; 