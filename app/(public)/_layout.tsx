import React from 'react';
import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="about" />
      <Stack.Screen name="services" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="admin-setup" />
    </Stack>
  );
} 