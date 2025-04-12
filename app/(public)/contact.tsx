import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Form Error', 'Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    // Simulating form submission
    setTimeout(() => {
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. We will get back to you soon!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
              });
              setIsSubmitting(false);
            }
          }
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <Container>
            <Text variant="h1" weight="bold" style={styles.headerTitle}>
              Contact Us
            </Text>
            <Text style={styles.headerSubtitle}>
              Get in touch with our team for any inquiries
            </Text>
          </Container>
        </View>

        {/* Contact Form Section */}
        <Container>
          <Card style={styles.formCard}>
            <Text variant="h3" weight="bold" style={styles.formTitle}>
              Send Us a Message
            </Text>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Subject of your message"
                value={formData.subject}
                onChangeText={(value) => handleChange('subject', value)}
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Your message"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={formData.message}
                onChangeText={(value) => handleChange('message', value)}
              />
            </View>
            
            <Button
              title="Send Message"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              style={styles.submitButton}
            />
          </Card>
        </Container>

        {/* Contact Information */}
        <View style={styles.infoSection}>
          <Container>
            <Text variant="h3" weight="bold" style={styles.infoTitle}>
              Contact Information
            </Text>
            
            <View style={styles.infoCards}>
              <Card style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <SafeIcon name="Mail" size={32} color={Colors.white} />
                </View>
                <Text variant="h5" weight="semiBold" style={styles.infoCardTitle}>
                  Email Us
                </Text>
                <Text style={styles.infoItem}>support@academiclessons.com</Text>
                <Text style={styles.infoItem}>info@academiclessons.com</Text>
              </Card>
              
              <Card style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <SafeIcon name="Phone" size={32} color={Colors.white} />
                </View>
                <Text variant="h5" weight="semiBold" style={styles.infoCardTitle}>
                  Call Us
                </Text>
                <Text style={styles.infoItem}>+234 800 123 4567</Text>
                <Text style={styles.infoItem}>+234 800 987 6543</Text>
              </Card>
              
              <Card style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <SafeIcon name="MapPin" size={32} color={Colors.white} />
                </View>
                <Text variant="h5" weight="semiBold" style={styles.infoCardTitle}>
                  Office Address
                </Text>
                <Text style={styles.infoItem}>123 Education Street</Text>
                <Text style={styles.infoItem}>Lagos, Nigeria</Text>
              </Card>
            </View>
          </Container>
        </View>

        {/* Office Hours */}
        <Container style={styles.hoursContainer}>
          <Card style={styles.hoursCard}>
            <View style={styles.hoursIconContainer}>
              <SafeIcon name="Clock" size={32} color={Colors.primary} />
            </View>
            <Text variant="h4" weight="semiBold" style={styles.hoursTitle}>
              Office Hours
            </Text>
            <View style={styles.hoursList}>
              <View style={styles.hoursRow}>
                <Text weight="semiBold" style={styles.hoursDay}>Monday - Friday:</Text>
                <Text style={styles.hoursTime}>9:00 AM - 6:00 PM</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text weight="semiBold" style={styles.hoursDay}>Saturday:</Text>
                <Text style={styles.hoursTime}>10:00 AM - 2:00 PM</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text weight="semiBold" style={styles.hoursDay}>Sunday:</Text>
                <Text style={styles.hoursTime}>Closed</Text>
              </View>
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
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  headerTitle: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
  },
  formCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
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
  messageInput: {
    height: 120,
    paddingTop: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  infoSection: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.xxl,
  },
  infoTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  infoCards: {
    flexDirection: 'column',
  },
  infoCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoCardTitle: {
    marginBottom: Spacing.sm,
  },
  infoItem: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  hoursContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  hoursCard: {
    alignItems: 'center',
  },
  hoursIconContainer: {
    marginBottom: Spacing.md,
  },
  hoursTitle: {
    marginBottom: Spacing.md,
  },
  hoursList: {
    width: '100%',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hoursDay: {
    flex: 1,
  },
  hoursTime: {
    flex: 1,
    textAlign: 'right',
  },
});

export default ContactPage; 