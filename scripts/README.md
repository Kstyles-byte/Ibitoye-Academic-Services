# Admin User Setup

This directory contains scripts to help with administrative tasks in the Academic Lessons application.

## Setting Up an Admin User

There are two ways to create an admin user:

### 1. Using the client-side script (Recommended)

This method uses the client-side Firebase SDK to create or update a user with admin privileges:

```bash
# Install dependencies if needed
npm install firebase

# Run the script
node scripts/create-admin-user.js
```

This script will:
- Create a new user account (if it doesn't exist) with email: `odoemenakamsy12@gmail.com` and password: `Marigold2020$`
- Set the user's role to 'ADMIN' in Firestore
- Allow you to log in to the application with admin privileges

### 2. Using the Firebase Admin SDK

If you have the Firebase Admin SDK set up with a service account, you can use this alternative script:

```bash
# First, place your service-account-key.json file in the root directory
# Then run:
npm install firebase-admin

# Run the script
node scripts/promote-to-admin.js
```

## Accessing the Admin Dashboard

Once the account is set up:

1. Open the application
2. Log in with:
   - Email: `odoemenakamsy12@gmail.com`
   - Password: `Marigold2020$`
3. You will be automatically redirected to the Admin Dashboard

## Note

Keep your admin credentials secure. This documentation should not be included in production builds. 