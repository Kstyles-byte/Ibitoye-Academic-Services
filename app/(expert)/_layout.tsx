import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../lib/firebase/hooks';
import { Role } from '../lib/db/types';
import { LoadingScreen } from '../components/UI';

export default function ExpertLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.replace('/(auth)/login');
    } else if (!loading && user) {
      // Convert role to uppercase for case-insensitive comparison
      const roleUpper = String(user.role).toUpperCase();
      
      // User is authenticated but not an expert, redirect to the appropriate dashboard
      if (roleUpper !== Role.EXPERT && roleUpper !== 'EXPERT') {
        if (roleUpper === Role.CLIENT || roleUpper === 'CLIENT') {
          router.replace('/(client)/dashboard');
        } else if (roleUpper === Role.ADMIN || roleUpper === 'ADMIN') {
          router.replace('/(admin)/dashboard');
        } else {
          // Fallback for any other role
          router.replace('/(auth)/login');
        }
      }
    }
  }, [user, loading, router]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      {/* Add other expert screens as they become available */}
    </Stack>
  );
} 