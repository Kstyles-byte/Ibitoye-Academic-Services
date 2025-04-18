import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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

// Admin user details
const adminUser = {
  email: 'engribitoye@gmail.com',
  password: 'excel777',
  displayName: 'Admin User',
  role: 'admin'
};

// Academic services with appropriate pricing
const academicServices = [
  {
    id: 'service_001',
    name: 'Proposal Writing Support',
    description: 'Expert assistance with academic research proposal writing, including methodology, literature review, and research design.',
    category: 'Writing',
    basePrice: 75.00,
    isActive: true
  },
  {
    id: 'service_002',
    name: 'Plagiarism Checking',
    description: 'Thorough document analysis to ensure academic integrity and originality of content.',
    category: 'Review',
    basePrice: 25.00,
    isActive: true
  },
  {
    id: 'service_003',
    name: 'Scholarship Application Assistance',
    description: 'Professional guidance on scholarship applications, including essay reviews and personal statement refinement.',
    category: 'Consultation',
    basePrice: 60.00,
    isActive: true
  },
  {
    id: 'service_004',
    name: 'Personal Statement Editing',
    description: 'Critical review and enhancement of personal statements for university admissions and scholarship applications.',
    category: 'Editing',
    basePrice: 45.00,
    isActive: true
  },
  {
    id: 'service_005',
    name: 'Literature Review Development',
    description: 'Comprehensive assistance with analyzing and synthesizing academic literature for research papers and dissertations.',
    category: 'Research',
    basePrice: 85.00,
    isActive: true
  },
  {
    id: 'service_006',
    name: 'Research Data Analysis',
    description: 'Expert support with qualitative and quantitative data analysis for academic research projects.',
    category: 'Research',
    basePrice: 95.00,
    isActive: true
  },
  {
    id: 'service_007',
    name: 'Academic Presentation Design',
    description: 'Professional creation of academic presentations for conferences, seminars, and defense meetings.',
    category: 'Design',
    basePrice: 55.00,
    isActive: true
  },
  {
    id: 'service_008',
    name: 'Custom Essay Writing',
    description: 'High-quality essay writing services tailored to specific academic requirements and guidelines.',
    category: 'Writing',
    basePrice: 65.00,
    isActive: true
  },
  {
    id: 'service_009',
    name: 'Admission Essay Review',
    description: 'Detailed review and feedback on university admission essays to improve chances of acceptance.',
    category: 'Review',
    basePrice: 40.00,
    isActive: true
  },
  {
    id: 'service_010',
    name: 'Dissertation Coaching',
    description: 'One-on-one guidance throughout the dissertation process, from proposal to final submission.',
    category: 'Consultation',
    basePrice: 120.00,
    isActive: true
  }
];

// Function to seed admin user
const seedAdminUser = async () => {
  try {
    // Create user with email and password
    const userCredential = await auth.createUserWithEmailAndPassword(
      adminUser.email,
      adminUser.password
    );
    
    // Update user profile
    await userCredential.user?.updateProfile({
      displayName: adminUser.displayName
    });
    
    // Save user data to Firestore
    await firestore.collection('users').doc(userCredential.user?.uid).set({
      email: adminUser.email,
      displayName: adminUser.displayName,
      role: adminUser.role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Admin user created successfully with UID: ${userCredential.user?.uid}`);
    return userCredential.user?.uid;
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    
    // Check if the error is because the user already exists
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists. Attempting to retrieve UID...');
      try {
        const userCredential = await auth.signInWithEmailAndPassword(
          adminUser.email,
          adminUser.password
        );
        console.log(`Existing admin user retrieved with UID: ${userCredential.user?.uid}`);
        return userCredential.user?.uid;
      } catch (signInError: any) {
        console.error('Error signing in to existing admin account:', signInError.message);
        return null;
      }
    }
    return null;
  }
};

// Function to seed academic services
const seedAcademicServices = async () => {
  try {
    const batch = firestore.batch();
    
    for (const service of academicServices) {
      const serviceRef = firestore.collection('services').doc(service.id);
      batch.set(serviceRef, {
        ...service,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`${academicServices.length} academic services added successfully.`);
    return true;
  } catch (error: any) {
    console.error('Error adding academic services:', error.message);
    return false;
  }
};

// Main function to run all seeding operations
const seedDatabase = async () => {
  console.log('Starting database seeding process...');
  
  // Seed admin user
  const adminUid = await seedAdminUser();
  
  if (adminUid) {
    console.log('Admin user seeding completed successfully.');
  } else {
    console.warn('Admin user seeding failed or was incomplete.');
  }
  
  // Seed academic services
  const servicesResult = await seedAcademicServices();
  
  if (servicesResult) {
    console.log('Academic services seeding completed successfully.');
  } else {
    console.warn('Academic services seeding failed or was incomplete.');
  }
  
  console.log('Database seeding process completed.');
  process.exit(0);
};

// Run the seeding process
seedDatabase().catch(error => {
  console.error('Fatal error during database seeding:', error);
  process.exit(1);
}); 