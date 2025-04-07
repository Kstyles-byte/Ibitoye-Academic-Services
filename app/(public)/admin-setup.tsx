import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Container, Card, Text, Button } from '../components/UI';
import { Colors, Spacing } from '../constants';
import { registerAdminUser } from '../lib/firebase/auth';
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Role } from '../lib/db/types';
import { useRouter } from 'expo-router';

// This is a development-only page for setting up an admin user
// It should be removed or disabled in production

const AdminSetupPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Hardcoded admin credentials
  const adminEmail = 'odoemenakamsy12@gmail.com';
  const adminPassword = 'Marigold2020$';
  
  const handleCreateAdmin = async () => {
    setIsLoading(true);
    
    try {
      // Try the regular registerAdminUser function first
      await registerAdminUser(adminEmail, adminPassword);
      
      // As a backup, also ensure the Firestore document exists with the correct role
      // This is a redundant step to ensure the admin role is set even if there were Firestore issues
      const auth = getAuth();
      const db = getFirestore();
      
      // Get the current user or sign in
      let uid;
      try {
        // Try to sign in to get the UID
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        uid = userCredential.user.uid;
        console.log('Logged in to set admin role in Firestore');
      } catch (loginError: any) {
        // If login fails, the user might not exist, so create it
        if (loginError.code === 'auth/user-not-found') {
          const newUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          uid = newUser.user.uid;
          console.log('Created new user to set admin role in Firestore');
        } else {
          throw loginError;
        }
      }
      
      // Ensure the Firestore document exists with admin role
      if (uid) {
        await setDoc(doc(db, 'users', uid), {
          id: uid,
          email: adminEmail,
          name: 'Admin User',
          role: Role.ADMIN,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('Ensured admin role is set in Firestore');
      }
      
      Alert.alert(
        'Success', 
        `Admin user created successfully!\n\nEmail: ${adminEmail}\nPassword: ${adminPassword}`,
        [
          { 
            text: 'Go to Login', 
            onPress: () => router.push('/(auth)/login')
          }
        ]
      );
    } catch (error: any) {
      let message = 'Failed to create admin user';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Try logging in instead.';
      }
      
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container>
      <View style={styles.container}>
        <Text variant="h2" weight="bold" style={styles.title}>
          Admin Setup
        </Text>
        
        <Card style={styles.card}>
          <Text variant="h4" weight="semiBold" style={styles.cardTitle}>
            Create Admin User
          </Text>
          
          <Text style={styles.warning}>
            ⚠️ This page is for development purposes only and should be removed in production.
          </Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{adminEmail}</Text>
            
            <Text style={styles.infoLabel}>Password:</Text>
            <Text style={styles.infoValue}>{adminPassword}</Text>
          </View>
          
          <Button
            title={isLoading ? 'Creating...' : 'Create Admin User'}
            onPress={handleCreateAdmin}
            isLoading={isLoading}
            style={styles.button}
            fullWidth
          />
          
          <Button
            title="Go to Login"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
            fullWidth
          />
        </Card>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  title: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  warning: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.danger + '15',
    borderRadius: 4,
  },
  infoContainer: {
    marginBottom: Spacing.lg,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs / 2,
  },
  infoValue: {
    backgroundColor: '#f5f5f5',
    padding: Spacing.sm,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    fontFamily: 'monospace',
  },
  button: {
    marginBottom: Spacing.md,
  },
});

export default AdminSetupPage; 