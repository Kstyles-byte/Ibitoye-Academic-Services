import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../lib/firebase/hooks';
import { Role } from '../lib/db/types';
import { LoadingScreen } from '../components/UI';

export default function AuthLayout() {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(`AuthLayout useEffect - User: ${user?.id || 'none'}, Loading: ${loading}, Error: ${error?.message || 'none'}`);
    
    if (!loading && user) {
      console.log(`AuthLayout: User is authenticated with role: ${user.role}, redirecting...`);
      
      // Convert role to uppercase for case-insensitive comparison with enum values
      const roleUpper = String(user.role).toUpperCase();
      
      // User is already authenticated, redirect based on role
      if (roleUpper === Role.CLIENT || roleUpper === 'CLIENT') {
        console.log('AuthLayout: Redirecting to client dashboard');
        router.replace('/(client)/dashboard');
      } else if (roleUpper === Role.EXPERT || roleUpper === 'EXPERT') {
        console.log('AuthLayout: Redirecting to expert dashboard');
        router.replace('/(expert)/dashboard');
      } else if (roleUpper === Role.ADMIN || roleUpper === 'ADMIN') {
        console.log('AuthLayout: Redirecting to admin dashboard');
        router.replace('/(admin)/dashboard');
      } else {
        // Default to client dashboard if role is not recognized
        console.log(`AuthLayout: Unknown role (${user.role}), defaulting to client dashboard`);
        router.replace('/(client)/dashboard');
      }
    } else if (!loading && error) {
      console.error(`AuthLayout: Authentication error: ${error.message}`);
    }
  }, [user, loading, error, router]);

  // Show loading screen while authentication state is being determined
  if (loading) {
    console.log('AuthLayout: Rendering loading screen while checking auth');
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If the user is authenticated, we'll redirect them in the useEffect
  // This ensures we still render something while the navigation is happening
  if (user) {
    console.log('AuthLayout: User is authenticated, showing loading while redirecting');
    return <LoadingScreen message="Redirecting..." />;
  }

  console.log('AuthLayout: Rendering auth stack (login/register)');
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Register',
          headerShown: false
        }} 
      />
    </Stack>
  );
} 