import React, { useState, useEffect, useRef } from 'react';
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
import { Container, Text, Button, Card, DatePicker } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAllServices, getServiceById } from '../lib/db/repositories/serviceRepository';
import { createServiceRequest, addAttachment } from '../lib/db/repositories/serviceRequestRepository';
import { Service, RequestStatus } from '../lib/db/types';
import { useAuth } from '../lib/firebase/hooks';
import * as DocumentPicker from 'expo-document-picker';
import { saveFileLocally, initializeStorage } from '../lib/cloudinary';
import { UPLOAD_FOLDERS, generateUniqueFilename } from '../lib/cloudinary/config';

// Add this at the top level of the file, outside of your component
// This lets TypeScript know about our global URL mapping
declare global {
  interface Window {
    cloudinaryUrlMap?: Record<string, string>;
  }
}

const RequestServicePage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const initialServiceIdSet = useRef(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const academicLevels = [
    { id: 1, name: 'High School' },
    { id: 2, name: 'Undergraduate' },
    { id: 3, name: 'Masters' },
    { id: 4, name: 'PhD' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceId: '',
    academicLevel: 0,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    budget: '',
    additionalNotes: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize storage and fetch services
    const setup = async () => {
      try {
        await initializeStorage();
      } catch (error) {
        console.error("Error initializing storage:", error);
      }
      
      fetchServices();
    };
    
    setup();
  }, []);

  // This effect only runs once after services are loaded and if there's a serviceId param
  useEffect(() => {
    if (services.length > 0 && params.serviceId && !initialServiceIdSet.current) {
      handleChange('serviceId', params.serviceId as string);
      initialServiceIdSet.current = true;
    }
  }, [params.serviceId, services]);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      // Fetch only active services
      const fetchedServices = await getAllServices(true);
      setServices(fetchedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Error", "Failed to load available services.");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleChange = (field: string, value: string | number | Date) => {
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

  const selectServiceType = (serviceId: string) => {
    handleChange('serviceId', serviceId);
  };

  const selectAcademicLevel = (id: number) => {
    handleChange('academicLevel', id);
  };

  const handleUploadFile = async () => {
    setIsUploading(true);
    
    try {
      // Use DocumentPicker to select a file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setIsUploading(false);
        return;
      }
      
      const file = result.assets[0];
      
      // Generate a unique filename
      const uniqueFilename = generateUniqueFilename(file.name);
      
      try {
        // Save file to Cloudinary
        const fileUrl = await saveFileLocally(file.uri, file.name, UPLOAD_FOLDERS.ATTACHMENTS);
        
        // Add to uploaded files array
        setUploadedFiles(prev => [
          ...prev, 
          uniqueFilename
        ]);

        // Store the URL mapping for later use during submission
        // This is needed because we're just storing filenames in state but need the URLs for the database
        if (!window.cloudinaryUrlMap) {
          window.cloudinaryUrlMap = {};
        }
        window.cloudinaryUrlMap[uniqueFilename] = fileUrl;
        
      } catch (err: any) {
        console.warn('Error saving file to Cloudinary:', err);
        Alert.alert(
          'Upload Error',
          'There was a problem uploading your file to the cloud. Please try again.',
          [{ text: 'OK' }]
        );
        throw err;
      }
      
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
      setIsUploading(false);
    }
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

    if (!formData.serviceId) {
      newErrors.serviceId = 'Please select a service type';
      isValid = false;
    }

    if (formData.academicLevel === 0) {
      newErrors.academicLevel = 'Please select an academic level';
      isValid = false;
    }

    // Validate the deadline (must be future date)
    if (!(formData.deadline instanceof Date) || formData.deadline < new Date()) {
      newErrors.deadline = 'Please select a future date for the deadline';
      isValid = false;
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getAcademicLevelName = (id: number) => {
    const level = academicLevels.find(level => level.id === id);
    return level ? level.name : '';
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to submit a request');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the date object directly for deadline
      const serviceRequest = await createServiceRequest({
        clientId: user.id,
        serviceId: formData.serviceId,
        subject: formData.title,
        requirements: formData.description,
        academicLevel: getAcademicLevelName(formData.academicLevel),
        deadline: {
          seconds: Math.floor(formData.deadline.getTime() / 1000),
          nanoseconds: 0
        },
        additionalInfo: formData.additionalNotes,
        status: RequestStatus.PENDING
      });

      // Create attachments in database for any uploaded files
      if (uploadedFiles.length > 0) {
        try {
          const uploadPromises = uploadedFiles.map(async (filename) => {
            // Get the Cloudinary URL from our mapping
            const fileUrl = window.cloudinaryUrlMap?.[filename] || '';
            
            // Create attachment record in database
            await addAttachment({
              serviceRequestId: serviceRequest.id,
              name: filename,
              fileUrl: fileUrl,
              fileType: filename.includes('.pdf') ? 'application/pdf' : 'application/octet-stream',
              fileSize: 0, // Cloudinary doesn't give us the size easily, we could store this separately if needed
              uploadedBy: user.id
            });
          });
          
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error('Error saving attachments:', error);
          // Continue with success flow even if attachments fail
        }
      }

      // Show success state
      setSubmissionSuccess(true);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.replace('/(client)/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting service request:', error);
      Alert.alert(
        'Submission Failed',
        'There was an error submitting your request. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : '';
  };

  const getServiceIcon = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return "FileText";
    
    const category = service.category.toLowerCase();
    if (category.includes('essay') || category.includes('writing')) return "Edit";
    if (category.includes('research')) return "Search";
    if (category.includes('presentation')) return "BarChart";
    if (category.includes('review') || category.includes('editing')) return "FileEdit";
    if (category.includes('math') || category.includes('statistic')) return "Calculator";
    if (category.includes('programming')) return "Code";
    if (category.includes('science')) return "Microscope";
    if (category.includes('language')) return "BookOpen";
    
    return "FileText";
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {submissionSuccess ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <SafeIcon name="CheckCircle" size={80} color={Colors.success} />
          </View>
          <Text variant="h3" weight="bold" style={styles.successTitle}>
            Request Submitted!
          </Text>
          <Text style={styles.successMessage}>
            Your service request has been submitted successfully. We will match you with an expert soon.
          </Text>
          <Text style={styles.redirectingText}>
            Redirecting to dashboard...
          </Text>
          <ActivityIndicator color={Colors.primary} style={styles.redirectingSpinner} />
        </View>
      ) : (
      <ScrollView style={styles.scrollView}>
        <Container>
          <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <SafeIcon name="ChevronLeft" size={24} color={Colors.muted} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
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
                    placeholderTextColor={Colors.muted + '80'}
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
                    placeholderTextColor={Colors.muted + '80'}
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
                {errors.serviceId && <Text style={styles.errorText}>{errors.serviceId}</Text>}
                
                {loadingServices ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={Colors.primary} size="small" />
                    <Text style={styles.loadingText}>Loading services...</Text>
                  </View>
                ) : (
              <View style={styles.serviceTypesGrid}>
                    {services.map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceTypeCard,
                          formData.serviceId === service.id && styles.selectedServiceType
                    ]}
                    onPress={() => selectServiceType(service.id)}
                  >
                    <SafeIcon
                          name={getServiceIcon(service.id) as any}
                      size={24}
                          color={formData.serviceId === service.id ? Colors.white : Colors.primary}
                    />
                    <Text
                      style={{
                        marginTop: Spacing.xs,
                        textAlign: 'center',
                            ...(formData.serviceId === service.id ? { color: Colors.white } : {})
                      }}
                    >
                      {service.name}
                    </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            marginTop: Spacing.xs / 2,
                            textAlign: 'center',
                            ...(formData.serviceId === service.id ? { color: Colors.white } : { color: Colors.muted })
                          }}
                        >
                          ₦{service.basePrice.toLocaleString()}
                        </Text>
                  </TouchableOpacity>
                ))}
                  </View>
                )}
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
                <DatePicker
                  date={formData.deadline}
                  onDateChange={(date) => handleChange('deadline', date)}
                  errorMessage={errors.deadline}
                  minimumDate={new Date()} // Prevent selecting past dates
                  placeholder="Select a deadline"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Budget (₦) *</Text>
                <TextInput
                  style={[styles.input, errors.budget ? styles.inputError : null]}
                  placeholder="Your budget in Naira"
                    placeholderTextColor={Colors.muted + '80'}
                  keyboardType="numeric"
                  value={formData.budget}
                  onChangeText={(value) => handleChange('budget', value)}
                />
                {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
                  {formData.serviceId && (
                    <Text style={styles.basePriceHint}>
                      Base price for {getServiceName(formData.serviceId)}: ₦
                      {services.find(s => s.id === formData.serviceId)?.basePrice.toLocaleString() || '0'}
                    </Text>
                  )}
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
                        <SafeIcon name="File" size={18} color={Colors.primary} />
                        <Text style={styles.fileName}>{file}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <SafeIcon name="X" size={18} color={Colors.danger} />
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
                  style={[styles.textArea, errors.additionalNotes ? styles.inputError : null]}
                placeholder="Any additional information or special requirements"
                  placeholderTextColor={Colors.muted + '80'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.additionalNotes}
                onChangeText={(value) => handleChange('additionalNotes', value)}
              />
                {errors.additionalNotes && <Text style={styles.errorText}>{errors.additionalNotes}</Text>}
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
      )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButtonText: {
    marginLeft: Spacing.xs,
    color: Colors.muted,
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
  inputHelper: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginLeft: Spacing.sm,
    color: Colors.muted,
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
  basePriceHint: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: Spacing.xs,
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light,
  },
  successIconContainer: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    marginBottom: Spacing.md,
    color: Colors.success,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  redirectingText: {
    color: Colors.muted,
    marginBottom: Spacing.sm,
  },
  redirectingSpinner: {
    marginTop: Spacing.sm,
  },
});

export default RequestServicePage; 