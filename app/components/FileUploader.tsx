import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { saveFileLocally } from '../lib/storage/fileStorage';

interface FileUploaderProps {
  onFileSelected: (fileUri: string, fileInfo: {
    name: string;
    size: number;
    type: string;
  }) => void;
  directory?: string;
  allowedTypes?: string[];
  buttonText?: string;
}

// Type guard for FileInfo
function isValidFileInfo(fileInfo: FileSystem.FileInfo | { exists: false; uri: string; isDirectory: false }): 
  fileInfo is FileSystem.FileInfo & { size: number } {
  return fileInfo.exists && 'size' in fileInfo;
}

/**
 * A reusable component for picking and uploading files to local storage
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  directory = 'attachments',
  allowedTypes = ['*/*'],
  buttonText = 'Select a file'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickDocument = async () => {
    setIsLoading(true);
    setError(null);

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
      
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const filename = `${timestamp}_${file.name}`;
      
      // Save file to local storage
      const savedUri = await saveFileLocally(file.uri, filename, directory);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(savedUri, { size: true });
      
      // Notify parent component
      onFileSelected(savedUri, {
        name: file.name,
        size: isValidFileInfo(fileInfo) ? fileInfo.size : 0,
        type: file.mimeType || 'application/octet-stream'
      });
      
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Failed to pick document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title={buttonText}
        onPress={pickDocument}
        disabled={isLoading}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Processing file...</Text>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 14,
  },
});

export default FileUploader; 