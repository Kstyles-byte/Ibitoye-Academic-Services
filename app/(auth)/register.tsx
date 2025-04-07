import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../lib/firebase/auth';
import { Role } from '../lib/db/types';

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear form-level errors when user changes any input
    if (formError) {
      setFormError(null);
    }
    
    // Clear success message when user changes any input after registration
    if (registrationSuccess) {
      setRegistrationSuccess(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Clear previous form errors
    setFormError(null);
    setRegistrationSuccess(null);
    
    if (!validateForm()) {
      console.log('Registration form validation failed');
      return;
    }

    console.log(`Attempting to register with email: ${formData.email}, name: ${formData.firstName} ${formData.lastName}`);
    setIsSubmitting(true);

    try {
      console.log('Calling registerUser function');
      // Register the user with Firebase
      await registerUser(
        formData.email, 
        formData.password, 
        `${formData.firstName} ${formData.lastName}`,
        Role.CLIENT
      );
      
      console.log('Registration successful - showing success message');
      setRegistrationSuccess('Your account has been created successfully! You can now log in.');
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
    } catch (error: any) {
      console.error('Registration error caught in register.tsx:', error);
      let errorMessage = 'An error occurred during registration';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'The email address is already in use by another account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        errorMessage = 'Your browser is blocking Firebase connections. Please check your ad blocker or privacy extensions.';
      } else if (error.message && error.message.includes('Function setDoc() called with invalid data')) {
        // This is a Firestore error when trying to create the user document
        console.warn('Firestore error detected, but account may have been created successfully');
        
        // The Firebase Auth account was created, but the Firestore user couldn't be created
        // We will still consider this a successful registration and let the fallback user data take over
        setRegistrationSuccess('Your account has been created but there was an issue setting up your profile. You can still log in, and the profile will be created automatically.');
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        
        setIsSubmitting(false);
        return; // Exit early to prevent the error alert below
      }
      
      console.log(`Setting form error: ${errorMessage}`);
      setFormError(errorMessage);
    } finally {
      console.log('Registration process completed - resetting isSubmitting');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <Container>
          <View style={styles.header}>
            <Text variant="h2" weight="bold" style={styles.title}>
              Create Account
            </Text>
            <Text style={styles.subtitle}>
              Register to access academic services
            </Text>
          </View>

          <Card style={styles.formCard}>
            {formError && (
              <View style={styles.formErrorContainer}>
                <Ionicons name="alert-circle" size={20} color={Colors.danger} />
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}
            
            {registrationSuccess && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.successText}>{registrationSuccess}</Text>
              </View>
            )}
            
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, errors.firstName ? styles.inputError : null]}
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChangeText={(value) => handleChange('firstName', value)}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={[styles.formField, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, errors.lastName ? styles.inputError : null]}
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleChange('lastName', value)}
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color={Colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <Button
              title="Register"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              style={styles.submitButton}
              fullWidth
            />

            <View style={styles.loginContainer}>
              <Text>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.muted,
  },
  formCard: {
    marginBottom: Spacing.xxl,
  },
  formErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + '20', // 20% opacity
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Spacing.md,
  },
  formErrorText: {
    color: Colors.danger,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20', // 20% opacity
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Spacing.md,
  },
  successText: {
    color: Colors.success,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formField: {
    marginBottom: Spacing.md,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.small,
    padding: Spacing.sm,
    fontSize: 16,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.small,
  },
  passwordInput: {
    flex: 1,
    padding: Spacing.sm,
    fontSize: 16,
  },
  passwordToggle: {
    padding: Spacing.sm,
  },
  submitButton: {
    marginVertical: Spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default RegisterPage; 