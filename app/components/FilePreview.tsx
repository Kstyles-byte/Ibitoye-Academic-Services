import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeIcon } from './UI/SafeIcon';
import { deleteLocalFile } from '../lib/cloudinary';
import { isImageFile, isVideoFile, isDocumentFile } from '../lib/cloudinary/config';

interface FilePreviewProps {
  uri: string;  // This will now be a Cloudinary URL or local URI
  name: string;
  type?: string;
  size?: number;
  onDelete?: () => void;
}

/**
 * Format file size into human-readable format (KB, MB, etc.)
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get the appropriate icon name based on file type
 */
const getFileIconName = (fileType: string, fileName: string): string => {
  // First try to determine from mime type
  const type = fileType.toLowerCase();
  
  if (type.includes('image') || isImageFile(fileName)) return 'Image';
  if (type.includes('pdf')) return 'FileText';
  if (type.includes('word') || type.includes('document')) return 'FileText';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'FileSpreadsheet';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'FilePresentation';
  if (type.includes('text') || type.includes('txt')) return 'FileText';
  if (type.includes('zip') || type.includes('compressed')) return 'Archive';
  if (type.includes('audio')) return 'Music';
  if (type.includes('video') || isVideoFile(fileName)) return 'Video';
  
  // If we can't determine from mime type, try from filename
  if (isDocumentFile(fileName)) return 'FileText';
  
  return 'File';
};

/**
 * Component to display a preview of a file with basic information
 */
const FilePreview: React.FC<FilePreviewProps> = ({
  uri,
  name,
  type = 'application/octet-stream',
  size = 0,
  onDelete
}) => {
  const isImage = type.toLowerCase().includes('image') || isImageFile(name);
  const iconName = getFileIconName(type, name);
  
  const handlePress = async () => {
    try {
      // Handle different URI types
      if (uri.startsWith('local://') && __DEV__) {
        // In development with local fallback, show a message
        alert('This is a local development file. In production, this would open the cloud URL.');
        return;
      }
      
      // For Cloudinary URLs or local file URIs, open them
      if (Platform.OS === 'web') {
        window.open(uri, '_blank');
      } else {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Could not open the file. The file might not be accessible from this device.');
    }
  };
  
  const handleDelete = async () => {
    if (onDelete) {
      try {
        // Skip cloud deletion for local development URIs
        if (!uri.startsWith('local://')) {
          await deleteLocalFile(uri);
        }
      } catch (error) {
        console.warn('Error deleting file (continuing anyway):', error);
      }
      
      // Call the onDelete callback
      onDelete();
    }
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {isImage ? (
        <Image source={{ uri }} style={styles.thumbnail} />
      ) : (
        <View style={styles.iconContainer}>
          <SafeIcon name={iconName as any} size={32} color="#666" />
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
          {name}
        </Text>
        <Text style={styles.fileInfo}>
          {formatFileSize(size)}
          {uri.startsWith('local://') && __DEV__ && ' (Local)'}
        </Text>
      </View>
      
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <SafeIcon name="Trash" size={22} color="#ff3b30" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 6,
  },
});

export default FilePreview; 