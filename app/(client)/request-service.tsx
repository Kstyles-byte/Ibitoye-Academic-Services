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
  ActivityIndicator
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const RequestServicePage = () => {
  const router = useRouter();

  const serviceTypes = [
    { id: 1, name: 'Assignment Help', icon: 'document-text' },
    { id: 2, name: 'Essay Writing', icon: 'pencil' },
    { id: 3, name: 'Research Paper', icon: 'newspaper' },
    { id: 4, name: 'Thesis/Dissertation', icon: 'school' },
    { id: 5, name: 'Programming/Coding', icon: 'code-slash' },
    { id: 6, name: 'Online Exam', icon: 'clipboard' },
  ];

  const academicLevels = [
    { id: 1, name: 'High School' },
    { id: 2, name: 'Undergraduate' },
    { id: 3, name: 'Masters' },
    { id: 4, name: 'PhD' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 0,
    academicLevel: 0,
    deadline: '',
    budget: '',
    additionalNotes: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes a change
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const selectServiceType = (id: number) => {
    handleChange('serviceType', id);
  };

  const selectAcademicLevel = (id: number) => {
    handleChange('academicLevel', id);
  };

  const handleUploadFile = () => {
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const fileName = `Document-${Math.floor(Math.random() * 1000)}.pdf`;
      setUploadedFiles(prev => [...prev, fileName]);
      setIsUploading(false);
    }, 1500);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (formData.serviceType === 0) {
      newErrors.serviceType = 'Please select a service type';
      isValid = false;
    }

    if (formData.academicLevel === 0) {
      newErrors.academicLevel = 'Please select an academic level';
      isValid = false;
    }

    if (!formData.deadline.trim()) {
      newErrors.deadline = 'Deadline is required';
      isValid = false;
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate request submission
    setTimeout(() => {
      Alert.alert(
        'Request Submitted',
        'Your service request has been submitted successfully. We will match you with an expert soon.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(client)/dashboard')
          }
        ]
      );
      setIsSubmitting(false);
    }, 2000);
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
              Request Academic Service
            </Text>
            <Text style={styles.subtitle}>
              Fill in the details below to submit your request
            </Text>
          </View>

          <Card style={styles.formCard}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Basic Information
              </Text>

              <View style={styles.formField}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={[styles.input, errors.title ? styles.inputError : null]}
                  placeholder="E.g., Essay on Climate Change"
                  value={formData.title}
                  onChangeText={(value) => handleChange('title', value)}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.textArea, errors.description ? styles.inputError : null]}
                  placeholder="Provide details about your assignment"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>
            </View>

            {/* Service Type */}
            <View style={styles.section}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Service Type *
              </Text>
              {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
              
              <View style={styles.serviceTypesGrid}>
                {serviceTypes.map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceTypeCard,
                      formData.serviceType === service.id && styles.selectedServiceType
                    ]}
                    onPress={() => selectServiceType(service.id)}
                  >
                    <Ionicons
                      name={service.icon as any}
                      size={24}
                      color={formData.serviceType === service.id ? Colors.white : Colors.primary}
                    />
                    <Text
                      style={{
                        marginTop: Spacing.xs,
                        textAlign: 'center',
                        ...(formData.serviceType === service.id ? { color: Colors.white } : {})
                      }}
                    >
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Academic Level */}
            <View style={styles.section}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Academic Level *
              </Text>
              {errors.academicLevel && <Text style={styles.errorText}>{errors.academicLevel}</Text>}
              
              <View style={styles.academicLevelsRow}>
                {academicLevels.map(level => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.academicLevelButton,
                      formData.academicLevel === level.id && styles.selectedAcademicLevel
                    ]}
                    onPress={() => selectAcademicLevel(level.id)}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        ...(formData.academicLevel === level.id ? { color: Colors.white } : {})
                      }}
                    >
                      {level.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Deadline and Budget */}
            <View style={styles.section}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Deadline and Budget
              </Text>

              <View style={styles.formField}>
                <Text style={styles.label}>Deadline *</Text>
                <TextInput
                  style={[styles.input, errors.deadline ? styles.inputError : null]}
                  placeholder="E.g., 15 July 2023"
                  value={formData.deadline}
                  onChangeText={(value) => handleChange('deadline', value)}
                />
                {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Budget (₦) *</Text>
                <TextInput
                  style={[styles.input, errors.budget ? styles.inputError : null]}
                  placeholder="Your budget in Naira"
                  keyboardType="numeric"
                  value={formData.budget}
                  onChangeText={(value) => handleChange('budget', value)}
                />
                {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
              </View>
            </View>

            {/* File Attachments */}
            <View style={styles.section}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                File Attachments
              </Text>
              <Text style={styles.sectionSubtitle}>
                Upload any relevant files, instructions, or references
              </Text>

              <Button
                title={isUploading ? "Uploading..." : "Upload File"}
                variant="outline"
                onPress={handleUploadFile}
                disabled={isUploading}
                style={styles.uploadButton}
                fullWidth
              />

              {isUploading && (
                <View style={styles.uploadingIndicator}>
                  <ActivityIndicator color={Colors.primary} />
                  <Text style={styles.uploadingText}>Uploading file...</Text>
                </View>
              )}

              {uploadedFiles.length > 0 && (
                <View style={styles.uploadedFilesContainer}>
                  <Text style={styles.uploadedFilesTitle}>Uploaded Files:</Text>
                  
                  {uploadedFiles.map((file, index) => (
                    <View key={index} style={styles.uploadedFile}>
                      <View style={styles.fileInfo}>
                        <Ionicons name="document" size={18} color={Colors.primary} />
                        <Text style={styles.fileName}>{file}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <Ionicons name="trash" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Additional Notes */}
            <View style={styles.section}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Additional Notes
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Any additional information or special requirements"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.additionalNotes}
                onChangeText={(value) => handleChange('additionalNotes', value)}
              />
            </View>

            <Button
              title={isSubmitting ? "Submitting..." : "Submit Request"}
              onPress={handleSubmit}
              isLoading={isSubmitting}
              style={styles.submitButton}
              fullWidth
            />
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
  },
  formCard: {
    marginBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
    color: Colors.muted,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.small,
    padding: Spacing.sm,
    fontSize: 16,
    minHeight: 120,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  serviceTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceTypeCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.medium,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  selectedServiceType: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceTypeName: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  selectedServiceTypeName: {
    color: Colors.white,
  },
  academicLevelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  academicLevelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.small,
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs / 2,
    alignItems: 'center',
  },
  selectedAcademicLevel: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  academicLevelText: {
    textAlign: 'center',
  },
  selectedAcademicLevelText: {
    color: Colors.white,
  },
  uploadButton: {
    marginBottom: Spacing.md,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadingText: {
    marginLeft: Spacing.sm,
    color: Colors.muted,
  },
  uploadedFilesContainer: {
    marginBottom: Spacing.md,
  },
  uploadedFilesTitle: {
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  uploadedFile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    marginLeft: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});

export default RequestServicePage; 