import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration - copied from app/config/firebase.config.ts
const firebaseConfig = {
  apiKey: "AIzaSyCmNn9PgxphgJKi1H4-vxnSKbRZDMQqhcs",
  authDomain: "ebitoye-acad.firebaseapp.com",
  projectId: "ebitoye-acad",
  storageBucket: "ebitoye-acad.firebasestorage.app",
  messagingSenderId: "91564213106",
  appId: "1:91564213106:web:ee167b89da1f5512f813eb"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();

// Create storage directory if it doesn't exist
const createStorageDirs = () => {
  const storagePath = path.join(process.cwd(), 'app', 'storage');
  const profilesPath = path.join(storagePath, 'profiles');
  const attachmentsPath = path.join(storagePath, 'attachments');
  const deliverablesPath = path.join(storagePath, 'deliverables');

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
    console.log(`Created storage directory: ${storagePath}`);
  }

  if (!fs.existsSync(profilesPath)) {
    fs.mkdirSync(profilesPath);
    console.log(`Created profiles directory: ${profilesPath}`);
  }

  if (!fs.existsSync(attachmentsPath)) {
    fs.mkdirSync(attachmentsPath);
    console.log(`Created attachments directory: ${attachmentsPath}`);
  }

  if (!fs.existsSync(deliverablesPath)) {
    fs.mkdirSync(deliverablesPath);
    console.log(`Created deliverables directory: ${deliverablesPath}`);
  }
};

// Expert users
const expertUsers = [
  {
    email: 'john.expert@example.com',
    password: 'Expert123!',
    displayName: 'John Smith',
    role: 'expert',
    profile: {
      bio: 'PhD in English Literature with over 10 years of experience in academic writing and editing.',
      education: 'PhD English Literature, University of Cambridge',
      hourlyRate: 75,
      isVerified: true,
      specializations: ['Writing', 'Editing', 'Research']
    }
  },
  {
    email: 'sarah.expert@example.com',
    password: 'Expert123!',
    displayName: 'Sarah Johnson',
    role: 'expert',
    profile: {
      bio: 'Data scientist with expertise in research methodology and statistical analysis.',
      education: 'MSc Data Science, Stanford University',
      hourlyRate: 85,
      isVerified: true,
      specializations: ['Research', 'Data Analysis', 'Consultation']
    }
  },
  {
    email: 'michael.expert@example.com',
    password: 'Expert123!',
    displayName: 'Michael Chen',
    role: 'expert',
    profile: {
      bio: 'Specializing in scholarship applications and personal statements with a high success rate.',
      education: 'MBA, Harvard Business School',
      hourlyRate: 80,
      isVerified: true,
      specializations: ['Consultation', 'Applications', 'Review']
    }
  }
];

// Client users
const clientUsers = [
  {
    email: 'emma.client@example.com',
    password: 'Client123!',
    displayName: 'Emma Wilson',
    role: 'client',
    profile: {
      phone: '+1234567890',
      academicLevel: 'Undergraduate',
      institution: 'University of Texas'
    }
  },
  {
    email: 'james.client@example.com',
    password: 'Client123!',
    displayName: 'James Brown',
    role: 'client',
    profile: {
      phone: '+2345678901',
      academicLevel: 'Graduate',
      institution: 'Columbia University'
    }
  },
  {
    email: 'olivia.client@example.com',
    password: 'Client123!',
    displayName: 'Olivia Martinez',
    role: 'client',
    profile: {
      phone: '+3456789012',
      academicLevel: 'PhD',
      institution: 'UCLA'
    }
  }
];

// Seed a user (expert or client)
const seedUser = async (userData: any) => {
  try {
    // Create user with email and password
    const userCredential = await auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );
    
    // Update user profile
    await userCredential.user?.updateProfile({
      displayName: userData.displayName
    });
    
    const uid = userCredential.user?.uid;
    
    // Save user data to Firestore
    await firestore.collection('users').doc(uid).set({
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // If user is an expert, save expert profile
    if (userData.role === 'expert') {
      await firestore.collection('experts').doc(uid).set({
        userId: uid,
        bio: userData.profile.bio,
        education: userData.profile.education,
        hourlyRate: userData.profile.hourlyRate,
        isVerified: userData.profile.isVerified,
        specializations: userData.profile.specializations,
        availability: true, // Default availability
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Create expertise area connections with services
      const services = await firestore.collection('services').get();
      const batch = firestore.batch();
      
      services.docs.forEach((serviceDoc) => {
        const service = serviceDoc.data();
        
        // Only connect expert to services that match their specializations
        if (userData.profile.specializations.includes(service.category)) {
          const expertiseRef = firestore.collection('expertiseAreas').doc();
          batch.set(expertiseRef, {
            expertId: uid,
            serviceId: serviceDoc.id,
            expertiseLevel: 'Advanced', // Default to advanced for seeded experts
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
      
      await batch.commit();
    }
    
    // If user is a client, save client profile
    if (userData.role === 'client') {
      await firestore.collection('clients').doc(uid).set({
        userId: uid,
        phone: userData.profile.phone,
        academicLevel: userData.profile.academicLevel,
        institution: userData.profile.institution,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log(`${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} user created successfully: ${userData.displayName} (${uid})`);
    return uid;
  } catch (error: any) {
    // Check if error is because user already exists
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User with email ${userData.email} already exists. Skipping.`);
    } else {
      console.error(`Error creating ${userData.role} user:`, error.message);
    }
    return null;
  }
};

// Seed experts
const seedExperts = async () => {
  console.log('Seeding expert users...');
  for (const expertData of expertUsers) {
    await seedUser(expertData);
  }
  console.log('Expert seeding completed.');
};

// Seed clients
const seedClients = async () => {
  console.log('Seeding client users...');
  for (const clientData of clientUsers) {
    await seedUser(clientData);
  }
  console.log('Client seeding completed.');
};

// Main function
const seedExpertsAndClients = async () => {
  console.log('Starting experts and clients seeding process...');
  
  // Create storage directories
  createStorageDirs();
  
  // Seed experts
  await seedExperts();
  
  // Seed clients
  await seedClients();
  
  console.log('Experts and clients seeding completed successfully.');
  process.exit(0);
};

// Run the seeding process
seedExpertsAndClients().catch(error => {
  console.error('Fatal error during experts and clients seeding:', error);
  process.exit(1);
}); 