import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../lib/firebase/hooks';
import { Role } from '../lib/db/types';
import { LoadingScreen } from '../components/UI';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.replace('/(auth)/login');
    } else if (!loading && user) {
      // Convert role to uppercase for case-insensitive comparison
      const roleUpper = String(user.role).toUpperCase();
      
      // User is authenticated but not an admin, redirect to the appropriate dashboard
      if (roleUpper !== Role.ADMIN && roleUpper !== 'ADMIN') {
        if (roleUpper === Role.CLIENT || roleUpper === 'CLIENT') {
          router.replace('/(client)/dashboard');
        } else if (roleUpper === Role.EXPERT || roleUpper === 'EXPERT') {
          router.replace('/(expert)/dashboard');
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
  
  // Don't render anything if not authenticated or not an admin
  if (!user) {
    return null;
  }
  
  // Convert role to uppercase for case-insensitive comparison
  const roleUpper = String(user.role).toUpperCase();
  if (roleUpper !== Role.ADMIN && roleUpper !== 'ADMIN') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="services" />
      <Stack.Screen name="requests" />
    </Stack>
  );
} 