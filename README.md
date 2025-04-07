# Academic Lessons - Mobile App

A mobile application for connecting students with expert tutors for academic assistance. Built with React Native, Expo, and Firebase.

## Features

- User authentication (Client, Expert, and Admin roles)
- Service request management
- Expert profile management
- Messaging system
- File attachments and deliverables
- Local file storage

## Technology Stack

- **Frontend:** React Native with Expo
- **Backend:** Firebase (Authentication, Firestore)
- **Local Storage:** Expo FileSystem

## Project Structure

```
├── app/                  # Main application code
│   ├── api/              # API endpoints
│   ├── config/           # Configuration files
│   ├── lib/              # Utility libraries
│   │   ├── db/           # Database utilities and repositories
│   │   ├── firebase/     # Firebase utilities
│   │   └── storage/      # File storage utilities
├── assets/               # Static assets
├── components/           # React components
├── constants/            # Constants and configurations
├── designs/              # Design references
├── storage/              # Local file storage directory
└── hooks/                # Custom React hooks
```

## Prerequisites

- Node.js (LTS version)
- Expo CLI
- Firebase account

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Add a web app to your Firebase project
4. Enable Authentication with Email/Password method
5. Create a Firestore database

## Firebase Configuration

The Firebase configuration has already been set up in `app/config/firebase.config.ts` with the following values:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCmNn9PgxphgJKi1H4-vxnSKbRZDMQqhcs",
  authDomain: "ebitoye-acad.firebaseapp.com",
  projectId: "ebitoye-acad",
  storageBucket: "ebitoye-acad.firebasestorage.app",
  messagingSenderId: "91564213106",
  appId: "1:91564213106:web:ee167b89da1f5512f813eb"
};
```

## Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd Academic-Lessons
```

2. Install dependencies
```bash
npm install
```

3. Run the application
```bash
npm start
```

## Database Schema

The application uses Firestore with the following collections:

- `users` - User accounts (all roles)
- `clients` - Client-specific profiles
- `experts` - Expert-specific profiles
- `services` - Available academic services
- `serviceRequests` - Requests from clients
- `serviceAssignments` - Assignments of experts to requests
- `attachments` - Files attached to service requests
- `deliverables` - Completed work by experts
- `messages` - Communication between clients and experts
- `expertiseAreas` - Expert specializations

## Authentication

The app supports three user roles:
- **Client**: Students seeking academic assistance
- **Expert**: Tutors providing academic services
- **Admin**: System administrators

## File Storage

Files are stored locally on the device using Expo FileSystem in the device's document directory.

Key file operations:
- Files are saved in subdirectories within the app's storage directory
- Attachments and deliverables are stored with references in the database
- When deleting database entries, associated files are automatically cleaned up

## Development Notes

- Add Firestore security rules to secure your database
- Remember to properly handle error cases in production 
- Make sure to handle file storage efficiently to avoid exhausting device storage
- Implement periodic cleanup of unused files to optimize storage usage
