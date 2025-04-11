import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, ActivityIndicator, Platform, Alert, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { saveFileLocally } from '../lib/cloudinary';
import { UPLOAD_FOLDERS, getMimeType } from '../lib/cloudinary/config';

interface FileUploaderProps {
  onFileSelected: (fileUrl: string, fileInfo: {
    name: string;
    size: number;
    type: string;
  }) => void;
  directory?: string;
  allowedTypes?: string[];
  buttonText?: string;
  maxFileSizeMB?: number;
}

/**
 * A reusable component for picking and uploading files to Cloudinary
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  directory = UPLOAD_FOLDERS.ATTACHMENTS,
  allowedTypes = ['*/*'],
  buttonText = 'Select a file',
  maxFileSizeMB = 10 // Default 10MB limit for Cloudinary free plan
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // For web file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection on web
  const handleWebFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    handleFile(file);
  };

  // Unified file handling function
  const handleFile = async (file: any) => {
    try {
      // For web, ensure we have a proper file type
      if (Platform.OS === 'web' && file instanceof File) {
        // If file.type is empty, try to guess from extension
        if (!file.type || file.type === 'application/octet-stream') {
          const mime = getMimeType(file.name);
          console.log(`Detected MIME type from extension: ${mime} for file: ${file.name}`);
          
          // Create a new File object with the correct type if needed
          if (mime !== 'application/octet-stream') {
            file = new File([file], file.name, { type: mime });
          }
        }
      }
      
      // Log file information
      console.log(`Processing file: ${file.name}`);
      console.log(`File type: ${file.type || file.mimeType || 'unknown'}`);
      console.log(`File size: ${file.size} bytes`);
      
      // Check file size
      const fileSizeMB = (file.size || 0) / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        setError(`File size exceeds ${maxFileSizeMB}MB limit. Please choose a smaller file.`);
        setIsLoading(false);
        return;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload to Cloudinary
      let fileUrl;
      try {
        console.log(`Attempting to upload file: ${file.name}, type: ${file.type || file.mimeType}, platform: ${Platform.OS}`);
        
        // For web, pass the File object directly
        if (Platform.OS === 'web') {
          console.log('Using web upload path with direct File object');
          fileUrl = await saveFileLocally(file, file.name, directory);
        } else {
          console.log('Using native upload path with URI');
          fileUrl = await saveFileLocally(file.uri, file.name, directory);
        }
        
        console.log(`Upload succeeded, received URL: ${fileUrl}`);
      } catch (err) {
        console.warn('Error with cloud upload:', err);
        console.warn('Using direct file reference as fallback');
        
        // Use local fallback in development
        if (__DEV__) {
          if (Platform.OS === 'web') {
            fileUrl = URL.createObjectURL(file);
            console.log(`Created fallback object URL: ${fileUrl}`);
          } else {
            fileUrl = file.uri;
            console.log(`Using file URI as fallback: ${fileUrl}`);
          }
        } else {
          console.error('Upload failed and not in dev mode, cannot use fallback');
          throw err;
        }
      }

      // Clear interval and set progress to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Notify parent component
      onFileSelected(fileUrl, {
        name: file.name,
        size: file.size || 0,
        type: file.type || file.mimeType || 'application/octet-stream'
      });

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(`Failed to upload file: ${err.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    // For web, use the file input
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      setIsLoading(false);
      return;
    }

    // For native platforms, use DocumentPicker
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const file = result.assets[0];
      handleFile(file);
    } catch (err: any) {
      console.error('Error picking document:', err);
      setError('Failed to pick document. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={allowedTypes.join(',')}
          onChange={handleWebFileSelect}
        />
      )}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={pickDocument}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Uploading..." : buttonText}
        </Text>
      </TouchableOpacity>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                { width: `${uploadProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>
            Uploading... {Math.round(uploadProgress)}%
          </Text>
        </View>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#0066ff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066ff',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 14,
  },
});

export default FileUploader; 