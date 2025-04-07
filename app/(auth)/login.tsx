import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signIn } from '../lib/firebase/auth';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    
    // Clear form-level error when user changes any input
    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Clear any previous form errors
    setFormError(null);
    
    if (!validateForm()) {
      console.log('Login form validation failed');
      return;
    }

    console.log(`Attempting to login with email: ${formData.email}`);
    setIsSubmitting(true);

    try {
      console.log('Calling signIn function');
      await signIn(formData.email, formData.password);
      console.log('Login successful - auth state change should trigger navigation');
      
      // If successful, the auth state will change and the app will navigate accordingly
    } catch (error: any) {
      console.error('Login error caught in login.tsx:', error);
      let errorMessage = 'An error occurred during login';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        errorMessage = 'Your browser is blocking Firebase connections. Please check your ad blocker or privacy extensions.';
      }
      
      console.log(`Setting form error: ${errorMessage}`);
      setFormError(errorMessage);
    } finally {
      console.log('Login process completed - resetting isSubmitting');
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
              Welcome Back
            </Text>
            <Text style={styles.subtitle}>
              Sign in to access your account
            </Text>
          </View>

          <Card style={styles.formCard}>
            {formError && (
              <View style={styles.formErrorContainer}>
                <Ionicons name="alert-circle" size={20} color={Colors.danger} />
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}
            
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
                  placeholder="Your password"
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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              style={styles.submitButton}
              fullWidth
            />

            <View style={styles.registerContainer}>
              <Text>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>Register</Text>
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
  formField: {
    marginBottom: Spacing.md,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    color: Colors.primary,
  },
  submitButton: {
    marginVertical: Spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default LoginPage; 