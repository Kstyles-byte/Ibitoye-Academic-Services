# Email Notification Setup with Resend

This document provides instructions for setting up email notifications in the Academic Lessons application using [Resend](https://resend.com).

## Overview

The application sends email notifications at the following points:
1. When a client submits a new service request (confirmation to client and notification to admin)
2. When an admin approves a request (notification to client)

## Setup Instructions

### 1. Create a Resend Account

1. Sign up for an account at [Resend](https://resend.com)
2. Verify your domain or use the sandbox domain for testing
3. Create an API key in the Resend dashboard

### 2. Configure Environment Variables

Add the following environment variables to your local development and production environments:

For local development, update the `.env` file:
```
RESEND_API_KEY=your_resend_api_key_here
ADMIN_EMAIL=admin@yourdomain.com
```

For Vercel deployment:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `ADMIN_EMAIL`: Email address where admin notifications should be sent

### 3. Testing Email Functionality

To test the email functionality locally:

1. Make sure you have set up the environment variables in your `.env` file
2. Submit a new service request from a client account
3. Check that the client receives a confirmation email
4. Check that the admin email receives a notification
5. From the admin panel, approve a request and verify the client receives an approval notification

## Troubleshooting

If emails are not being sent:

1. Check the console logs for errors
2. Verify your Resend API key is correct and has appropriate permissions
3. Ensure the email addresses you're sending to are valid
4. Check if your Resend account has any sending limits or restrictions
5. For production, make sure the environment variables are properly set in Vercel

## Customizing Email Templates

Email templates are located in:
- `app/lib/email/templates/requestConfirmation.ts` - Client request confirmation
- `app/lib/email/templates/adminNotification.ts` - Admin notification
- `app/lib/email/templates/requestApproved.ts` - Request approval notification

You can modify the HTML and text content in these files to customize the email appearance and messaging. 