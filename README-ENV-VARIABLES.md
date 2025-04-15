# Environment Variables in Expo Applications

## The EXPO_PUBLIC_ Prefix

When working with environment variables in Expo/React Native applications, it's important to understand that there are two contexts where your code runs:

1. **Server-side code** (Node.js) - During build time
2. **Client-side code** (Browser/Device) - During runtime in users' browsers/devices

For security reasons, most environment variables are only available during build time. If you need to access an environment variable in client-side code (the code that runs in the browser), you must prefix it with `EXPO_PUBLIC_`.

## How to Use Environment Variables in Expo

### In .env Files

```
# Server-side only (not accessible in client code)
API_SECRET=your_server_only_secret

# Client-side accessible (prefixed with EXPO_PUBLIC_)
EXPO_PUBLIC_API_KEY=your_public_api_key
```

### In Code

```javascript
// This will be available in client code
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

// This will be undefined in client code, only available during build
const apiSecret = process.env.API_SECRET;
```

## Environment Variables in Vercel

When deploying to Vercel, make sure to add both versions of your environment variables in the Vercel dashboard:

1. The regular version (e.g., `RESEND_API_KEY`) 
2. The EXPO_PUBLIC_ prefixed version (e.g., `EXPO_PUBLIC_RESEND_API_KEY`)

You can also set these in your `vercel.json` file:

```json
{
  "env": {
    "RESEND_API_KEY": "your_api_key",
    "EXPO_PUBLIC_RESEND_API_KEY": "your_api_key"
  }
}
```

## The Fix for "Missing API Key" Error

The error "Missing API key" occurred because:

1. The Resend API key was only defined as `RESEND_API_KEY` without the `EXPO_PUBLIC_` prefix
2. When the code ran in the client's browser, `process.env.RESEND_API_KEY` was undefined
3. This caused the Resend constructor to throw an error

The fix involves:

1. Adding the EXPO_PUBLIC_ prefixed versions of all environment variables
2. Using fallbacks in the code to handle missing values
3. Updating the initialization code to handle potential undefined values

```javascript
// Get API key with fallbacks
const API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY || 'default_key';

// Initialize Resend with API key
const resend = new Resend(API_KEY);
```

Remember that if you change environment variables, you'll need to rebuild your application for the changes to take effect. 