import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut, updateUserPassword } from '../lib/firebase/auth';

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');

  // Placeholder user data
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+234 801 234 5678',
    university: 'University of Lagos',
    course: 'Computer Science',
    year: '3rd Year',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    serviceUpdates: true,
    promotionalEmails: false,
    expertMessages: true,
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProfileChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
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
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveProfile = () => {
    Alert.alert('Success', 'Profile information has been updated.');
  };

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Attempting to update password');
      await updateUserPassword(passwordForm.newPassword);
      
      Alert.alert('Success', 'Your password has been updated successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'An error occurred while updating your password';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please logout and log back in before changing your password.';
      }
      
      Alert.alert('Password Update Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut();
              // The auth state change will trigger navigation to login
            } catch (error) {
              Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
            }
          },
        },
      ]
    );
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
              Profile Settings
            </Text>
            <Text style={styles.subtitle}>
              Manage your account information and preferences
            </Text>
          </View>

          {/* Profile Summary */}
          <Card style={styles.profileSummary}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text variant="h4" weight="semiBold" style={styles.profileName}>
                  {userData.firstName} {userData.lastName}
                </Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
              </View>
            </View>
          </Card>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
              onPress={() => setActiveTab('personal')}
            >
              <Text style={{ 
                ...styles.tabText, 
                ...(activeTab === 'personal' ? styles.activeTabText : {}) 
              }}>
                Personal Info
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'security' && styles.activeTab]}
              onPress={() => setActiveTab('security')}
            >
              <Text style={{ 
                ...styles.tabText, 
                ...(activeTab === 'security' ? styles.activeTabText : {}) 
              }}>
                Security
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
              onPress={() => setActiveTab('notifications')}
            >
              <Text style={{ 
                ...styles.tabText, 
                ...(activeTab === 'notifications' ? styles.activeTabText : {}) 
              }}>
                Notifications
              </Text>
            </TouchableOpacity>
          </View>

          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <Card style={styles.tabContent}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Personal Information
              </Text>
              
              <View style={styles.formRow}>
                <View style={[styles.formField, styles.halfWidth]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={userData.firstName}
                    onChangeText={(value) => handleProfileChange('firstName', value)}
                  />
                </View>

                <View style={[styles.formField, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={userData.lastName}
                    onChangeText={(value) => handleProfileChange('lastName', value)}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={userData.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(value) => handleProfileChange('email', value)}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={userData.phone}
                  keyboardType="phone-pad"
                  onChangeText={(value) => handleProfileChange('phone', value)}
                />
              </View>

              <Text variant="h4" weight="semiBold" style={{
                ...styles.sectionTitle,
                ...styles.sectionDivider
              }}>
                Academic Information
              </Text>

              <View style={styles.formField}>
                <Text style={styles.label}>University/Institution</Text>
                <TextInput
                  style={styles.input}
                  value={userData.university}
                  onChangeText={(value) => handleProfileChange('university', value)}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Course/Major</Text>
                <TextInput
                  style={styles.input}
                  value={userData.course}
                  onChangeText={(value) => handleProfileChange('course', value)}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Year of Study</Text>
                <TextInput
                  style={styles.input}
                  value={userData.year}
                  onChangeText={(value) => handleProfileChange('year', value)}
                />
              </View>

              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                style={styles.saveButton}
              />
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card style={styles.tabContent}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Change Password
              </Text>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={[styles.input, errors.currentPassword ? styles.inputError : null]}
                  secureTextEntry
                  value={passwordForm.currentPassword}
                  onChangeText={(value) => handlePasswordChange('currentPassword', value)}
                />
                {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, errors.newPassword ? styles.inputError : null]}
                  secureTextEntry
                  value={passwordForm.newPassword}
                  onChangeText={(value) => handlePasswordChange('newPassword', value)}
                />
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                  secureTextEntry
                  value={passwordForm.confirmPassword}
                  onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <Button
                title={isSubmitting ? "Updating..." : "Update Password"}
                onPress={handleSavePassword}
                isLoading={isSubmitting}
                style={styles.saveButton}
              />

              <View style={styles.logoutSection}>
                <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                  Account
                </Text>
                <Button
                  title="Log Out"
                  variant="danger"
                  onPress={handleLogout}
                  style={styles.logoutButton}
                />
              </View>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card style={styles.tabContent}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Notification Settings
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications via email
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.emailNotifications}
                  onValueChange={() => handleNotificationToggle('emailNotifications')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={notificationSettings.emailNotifications ? Colors.white : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Service Updates</Text>
                  <Text style={styles.settingDescription}>
                    Updates about your academic services
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.serviceUpdates}
                  onValueChange={() => handleNotificationToggle('serviceUpdates')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={notificationSettings.serviceUpdates ? Colors.white : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Promotional Emails</Text>
                  <Text style={styles.settingDescription}>
                    Special offers and promotional content
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.promotionalEmails}
                  onValueChange={() => handleNotificationToggle('promotionalEmails')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={notificationSettings.promotionalEmails ? Colors.white : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Expert Messages</Text>
                  <Text style={styles.settingDescription}>
                    Notifications when experts message you
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.expertMessages}
                  onValueChange={() => handleNotificationToggle('expertMessages')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={notificationSettings.expertMessages ? Colors.white : '#f4f3f4'}
                />
              </View>

              <Button
                title="Save Preferences"
                onPress={() => Alert.alert('Success', 'Notification preferences have been updated.')}
                style={styles.saveButton}
              />
            </Card>
          )}
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
  },
  profileSummary: {
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: Spacing.xs / 2,
  },
  profileEmail: {
    color: Colors.muted,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontWeight: '500',
    color: Colors.muted,
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabContent: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sectionDivider: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  saveButton: {
    marginTop: Spacing.md,
  },
  logoutSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButton: {
    marginTop: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: Spacing.xs / 2,
  },
  settingDescription: {
    color: Colors.muted,
    fontSize: 14,
  },
});

export default ProfilePage; 