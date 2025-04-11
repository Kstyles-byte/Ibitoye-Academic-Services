import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Container, Text, Card, Button } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import FileUploader from '../components/FileUploader';
import FilePreview from '../components/FilePreview';
import { useAuth } from '../lib/firebase/hooks';
import { initializeStorage } from '../lib/cloudinary';
import { addAttachment, getServiceRequestsByClientId } from '../lib/db/repositories/serviceRequestRepository';
import { ServiceRequest, RequestStatus } from '../lib/db/types';
import { UPLOAD_FOLDERS } from '../lib/cloudinary/config';

// Add this at the top level of the file, outside of your component
declare global {
  interface Window {
    cloudinaryUrlMap?: Record<string, string>;
  }
}

const UploadPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    uri: string;
    name: string;
    size: number;
    type: string;
  }>>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeServices, setActiveServices] = useState<Array<{
    id: string;
    title: string;
  }>>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  // Initialize storage when the component mounts
  useEffect(() => {
    const setup = async () => {
      try {
        await initializeStorage();
      } catch (error) {
        console.error("Error initializing storage:", error);
      }
    };
    
    setup();
    fetchActiveServices();
  }, []);

  // Fetch active service requests for the current user
  const fetchActiveServices = async () => {
    if (!user || !user.id) return;
    
    setLoadingServices(true);
    try {
      // Get all service requests for the current user
      const requests = await getServiceRequestsByClientId(user.id);
      
      // Filter out completed requests
      const activeRequests = requests.filter(
        request => request.status !== RequestStatus.COMPLETED
      );
      
      // Map to format needed for dropdown
      const services = activeRequests.map((request: ServiceRequest) => ({
        id: request.id,
        title: request.subject || 'Untitled Request'
      }));
      
      setActiveServices(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Error", "Failed to load your active services. Please try again later.");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleFileSelected = (fileUrl: string, fileInfo: { name: string; size: number; type: string }) => {
    setUploadedFiles([...uploadedFiles, {
      uri: fileUrl,
      name: fileInfo.name,
      size: fileInfo.size,
      type: fileInfo.type
    }]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      Alert.alert('Error', 'Please upload at least one file');
      return;
    }

    if (!selectedServiceId) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to upload files');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create attachment entries in the database for each file
      const uploadPromises = uploadedFiles.map(file => {
        // Create the attachment entry with the Cloudinary URL
        return addAttachment({
          serviceRequestId: selectedServiceId,
          name: file.name,
          fileUrl: file.uri, // This is now a Cloudinary URL
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: user.id
        });
      });
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // Show success state
      setUploadSuccess(true);
      
      // Clear form after successful upload
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadedFiles([]);
        setSelectedServiceId(null);
        router.push('/(client)/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      Alert.alert(
        'Upload Failed',
        'There was an error uploading your files. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  if (uploadSuccess) {
    return (
      <Container>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <SafeIcon name="CheckCircle" size={80} color={Colors.success} />
          </View>
          <Text variant="h3" weight="bold" style={styles.successTitle}>
            Files Uploaded!
          </Text>
          <Text style={styles.successMessage}>
            Your files have been uploaded successfully and are now available to our team.
          </Text>
          <Text style={styles.redirectingText}>
            Redirecting to dashboard...
          </Text>
          <ActivityIndicator color={Colors.primary} style={styles.redirectingSpinner} />
        </View>
      </Container>
    );
  }

  return (
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
            Upload Files
          </Text>
          <Text style={styles.subtitle}>
            Upload documents for your active services
          </Text>
        </View>

        <Card style={styles.uploadCard}>
          <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
            Select Service
          </Text>
          <Text style={styles.sectionDescription}>
            Choose which service these files are for
          </Text>

          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading your services...</Text>
            </View>
          ) : activeServices.length > 0 ? (
            <View style={styles.serviceSelectionContainer}>
              {activeServices.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceItem,
                    selectedServiceId === service.id && styles.selectedServiceItem
                  ]}
                  onPress={() => handleServiceSelect(service.id)}
                >
                  <SafeIcon 
                    name={selectedServiceId === service.id ? "CheckCircle" : "Circle"} 
                    size={20} 
                    color={selectedServiceId === service.id ? Colors.primary : Colors.muted} 
                  />
                  <Text 
                    style={[
                      styles.serviceItemText,
                      selectedServiceId === service.id && styles.selectedServiceItemText
                    ] as any}
                  >
                    {service.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <SafeIcon name="AlertCircle" size={32} color={Colors.muted} />
              <Text style={styles.emptyText}>No active services found</Text>
              <Text style={styles.emptySubtext}>
                Submit a service request first to upload files for it
              </Text>
              <Button 
                title="Request a Service" 
                variant="outline"
                onPress={() => router.push('/(client)/request-service')} 
                style={styles.actionButton}
              />
            </View>
          )}

          <View style={styles.divider} />

          <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
            Upload Documents
          </Text>
          <Text style={styles.sectionDescription}>
            Upload assignments, reference materials, or any other relevant documents
          </Text>

          <View style={styles.uploaderContainer}>
            <FileUploader 
              onFileSelected={handleFileSelected}
              buttonText="Select Files to Upload"
              directory="client-uploads"
            />
          </View>

          {uploadedFiles.length > 0 && (
            <View style={styles.filePreviewContainer}>
              <Text variant="h5" weight="semiBold" style={styles.previewTitle}>
                Selected Files
              </Text>
              
              {uploadedFiles.map((file, index) => (
                <FilePreview
                  key={index}
                  uri={file.uri}
                  name={file.name}
                  size={file.size}
                  type={file.type}
                  onDelete={() => handleRemoveFile(index)}
                />
              ))}
            </View>
          )}

          <View style={styles.submitContainer}>
            <Button
              title={isUploading ? "Uploading..." : "Upload Files"}
              onPress={handleSubmit}
              disabled={isUploading || uploadedFiles.length === 0 || !selectedServiceId || activeServices.length === 0}
              fullWidth
            />
            
            {isUploading && (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.uploadingText}>Uploading files...</Text>
              </View>
            )}
          </View>
        </Card>
      </Container>
    </ScrollView>
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
    color: Colors.muted,
    marginLeft: Spacing.xs,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
  },
  uploadCard: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  serviceSelectionContainer: {
    marginBottom: Spacing.md,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.muted,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Spacing.sm,
  },
  selectedServiceItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  serviceItemText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  selectedServiceItemText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.muted + '30',
    marginVertical: Spacing.md,
  },
  uploaderContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filePreviewContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewTitle: {
    marginBottom: Spacing.sm,
  },
  submitContainer: {
    marginTop: Spacing.md,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  uploadingText: {
    marginLeft: Spacing.sm,
    color: Colors.primary,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyText: {
    marginTop: Spacing.sm,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    color: Colors.muted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light,
    height: 500,
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

export default UploadPage; 