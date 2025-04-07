import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { signIn } from '../lib/firebase/auth';

interface SignInFormProps {
  onSignInSuccess: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignInSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      onSignInSuccess();
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle specific error codes
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
          Alert.alert('Error', 'Invalid email or password. Please try again.');
        } else if (errorMessage.includes('auth/invalid-email')) {
          Alert.alert('Error', 'Please enter a valid email address.');
        } else if (errorMessage.includes('auth/too-many-requests')) {
          Alert.alert('Error', 'Too many failed login attempts. Please try again later.');
        } else {
          Alert.alert('Error', 'An error occurred during sign in. Please try again.');
        }
      } else {
        Alert.alert('Error', 'An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0d0fa',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignInForm; 