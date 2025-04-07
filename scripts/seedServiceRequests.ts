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

const firestore = firebase.firestore();

// Sample service request data
interface ServiceRequestData {
  title: string;
  description: string;
  clientId: string;
  serviceId: string;
  status: string;
  budget: number;
  deadline: Date;
}

// Define interfaces for data from Firestore
interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  [key: string]: any;
}

interface Expert {
  id: string;
  userId: string;
  bio: string;
  education: string;
  hourlyRate: number;
  isVerified: boolean;
  specializations: string[];
  availability: boolean;
  [key: string]: any;
}

interface Client {
  id: string;
  userId: string;
  [key: string]: any;
}

// Main function to seed service requests
const seedServiceRequests = async () => {
  console.log('Starting service requests seeding...');
  
  try {
    // Get clients
    const clientsSnapshot = await firestore.collection('clients').get();
    const clients: Client[] = clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Client));
    
    if (clients.length === 0) {
      console.error('No clients found. Run seedExpertsClients.ts first.');
      process.exit(1);
    }
    
    // Get services
    const servicesSnapshot = await firestore.collection('services').get();
    const services: Service[] = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service));
    
    if (services.length === 0) {
      console.error('No services found. Run seedDatabase.ts first.');
      process.exit(1);
    }
    
    // Get experts
    const expertsSnapshot = await firestore.collection('experts').get();
    const experts: Expert[] = expertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Expert));
    
    if (experts.length === 0) {
      console.error('No experts found. Run seedExpertsClients.ts first.');
      process.exit(1);
    }
    
    // Create sample service requests
    const serviceRequests: ServiceRequestData[] = [
      {
        title: 'Research Proposal for PhD Application',
        description: 'I need help developing a compelling research proposal for my PhD application in Environmental Science. The proposal should be around 2,000 words and include a literature review, methodology, and expected outcomes.',
        clientId: clients[0].id,
        serviceId: services.find((s) => s.name === 'Proposal Writing Support')?.id || services[0].id,
        status: 'submitted',
        budget: 150,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        title: 'Personal Statement for MBA Application',
        description: 'I need assistance with crafting a personal statement for my MBA application to top business schools. It should highlight my professional experiences and career aspirations.',
        clientId: clients[1].id,
        serviceId: services.find((s) => s.name === 'Personal Statement Editing')?.id || services[0].id,
        status: 'in_progress',
        budget: 120,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Literature Review for Dissertation',
        description: 'I need help with a comprehensive literature review for my dissertation on cognitive psychology. The review should be around 5,000 words and cover the latest research in the field.',
        clientId: clients[2].id,
        serviceId: services.find((s) => s.name === 'Literature Review Development')?.id || services[0].id,
        status: 'pending_payment',
        budget: 200,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
      }
    ];
    
    console.log(`Creating ${serviceRequests.length} service requests...`);
    
    // Add service requests to Firestore
    const createdRequestIds = [];
    for (const requestData of serviceRequests) {
      const requestRef = firestore.collection('serviceRequests').doc();
      
      await requestRef.set({
        title: requestData.title,
        description: requestData.description,
        clientId: requestData.clientId,
        serviceId: requestData.serviceId,
        status: requestData.status,
        budget: requestData.budget,
        deadline: firebase.firestore.Timestamp.fromDate(requestData.deadline),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Created service request: ${requestData.title} (${requestRef.id})`);
      createdRequestIds.push(requestRef.id);
      
      // If the request is in_progress, create a service assignment
      if (requestData.status === 'in_progress') {
        // Find a matching expert based on the service
        const matchingExpert = experts.find((expert) => {
          const service = services.find((s) => s.id === requestData.serviceId);
          return expert.specializations && 
                service && 
                expert.specializations.includes(service.category);
        });
        
        if (matchingExpert) {
          const assignmentRef = firestore.collection('serviceAssignments').doc();
          
          await assignmentRef.set({
            serviceRequestId: requestRef.id,
            expertId: matchingExpert.id,
            status: 'active',
            assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
            dueDate: firebase.firestore.Timestamp.fromDate(requestData.deadline),
            paymentStatus: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`Created service assignment: ${requestRef.id} → ${matchingExpert.id}`);
          
          // Update the service request to link to the assignment
          await requestRef.update({
            serviceAssignmentId: assignmentRef.id,
            expertId: matchingExpert.id
          });
        }
      }
    }
    
    // Create sample messages for the first service request
    if (createdRequestIds.length > 0) {
      const firstRequestId = createdRequestIds[0];
      const clientId = serviceRequests[0].clientId;
      
      // Get an admin user
      const adminsSnapshot = await firestore.collection('users').where('role', '==', 'admin').limit(1).get();
      if (!adminsSnapshot.empty) {
        const adminId = adminsSnapshot.docs[0].id;
        
        // Create messages
        const messages = [
          {
            serviceRequestId: firstRequestId,
            senderId: adminId,
            receiverId: clientId,
            content: "Hello! Thank you for submitting your service request. We're currently reviewing it and will assign an expert shortly.",
            isRead: true,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 48 * 60 * 60 * 1000)) // 48 hours ago
          },
          {
            serviceRequestId: firstRequestId,
            senderId: clientId,
            receiverId: adminId,
            content: "Great, thank you! When can I expect to hear back about the assigned expert?",
            isRead: true,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 47 * 60 * 60 * 1000)) // 47 hours ago
          },
          {
            serviceRequestId: firstRequestId,
            senderId: adminId,
            receiverId: clientId,
            content: "We aim to match you with an expert within 24-48 hours. I'll update you as soon as we have someone suitable for your project.",
            isRead: false,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 46 * 60 * 60 * 1000)) // 46 hours ago
          }
        ];
        
        const batch = firestore.batch();
        
        for (const messageData of messages) {
          const messageRef = firestore.collection('messages').doc();
          batch.set(messageRef, messageData);
        }
        
        await batch.commit();
        console.log(`Created ${messages.length} sample messages for the first service request.`);
      }
    }
    
    console.log('Service requests seeding completed successfully!');
  } catch (error: any) {
    console.error('Error seeding service requests:', error.message);
  }
};

// Run the seeding process
seedServiceRequests()
  .then(() => {
    console.log('All seeding operations completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error during service requests seeding:', error);
    process.exit(1);
  }); 