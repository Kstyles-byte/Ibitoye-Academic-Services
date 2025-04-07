import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeIcon } from './UI/SafeIcon';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

interface FilePreviewProps {
  uri: string;
  name: string;
  type?: string;
  size?: number;
  onDelete?: () => void;
}

/**
 * Formats file size to a human-readable format
 */
const formatFileSize = (bytes: number = 0): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets the icon name to display based on file type
 */
const getFileIconName = (type: string = ''): string => {
  const mimeType = type.toLowerCase();
  
  if (mimeType.includes('image')) return 'ImageIcon';
  if (mimeType.includes('pdf')) return 'FileText';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'FileText';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'Grid';
  if (mimeType.includes('video')) return 'Video';
  if (mimeType.includes('audio')) return 'Music';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'Archive';
  
  // Default
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
  const isImage = type.toLowerCase().includes('image');
  const iconName = getFileIconName(type);
  
  const handlePress = async () => {
    try {
      // On web platform, just open the URL
      if (Platform.OS === 'web') {
        window.open(uri, '_blank');
        return;
      }
      
      // On native platforms, check if file exists first
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.error('File does not exist:', uri);
        return;
      }
      
      // Open file
      await Linking.openURL(uri);
    } catch (error) {
      console.error('Error opening file:', error);
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
        </Text>
      </View>
      
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
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
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});

export default FilePreview; 