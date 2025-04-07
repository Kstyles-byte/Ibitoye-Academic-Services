import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Base storage directory
const STORAGE_DIRECTORY = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'storage/' : 'storage/';

// Web storage implementation using localStorage
class WebStorage {
  static async saveFile(key: string, content: string): Promise<string> {
    try {
      localStorage.setItem(key, content);
      return key;
    } catch (error) {
      console.error('WebStorage: Error saving file', error);
      throw error;
    }
  }

  static async getFile(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  static async deleteFile(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  static async listKeys(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }
}

// Ensure the storage directory exists
const ensureDirectoryExists = async (directory: string) => {
  // Skip on web platform
  if (Platform.OS === 'web') return;
  
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
};

// Save a file locally and return the local URI
export const saveFileLocally = async (fileUri: string, filename: string, subdirectory = ''): Promise<string> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      const key = `${subdirectory}/${filename}`;
      // For web, we just save the URI as we can't actually copy files
      return WebStorage.saveFile(key, fileUri);
    }
    
    // Native implementation
    const directory = STORAGE_DIRECTORY + (subdirectory ? `${subdirectory}/` : '');
    await ensureDirectoryExists(directory);
    
    const destinationUri = directory + filename;
    await FileSystem.copyAsync({
      from: fileUri,
      to: destinationUri
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw error;
  }
};

// Delete a local file
export const deleteLocalFile = async (fileUri: string): Promise<void> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      return WebStorage.deleteFile(fileUri);
    }
    
    // Native implementation
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
    throw error;
  }
};

// Get list of local files in a directory
export const listLocalFiles = async (subdirectory = ''): Promise<string[]> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      return WebStorage.listKeys(subdirectory);
    }
    
    // Native implementation
    const directory = STORAGE_DIRECTORY + (subdirectory ? `${subdirectory}/` : '');
    await ensureDirectoryExists(directory);
    
    return await FileSystem.readDirectoryAsync(directory);
  } catch (error) {
    console.error('Error listing local files:', error);
    if (Platform.OS === 'web') return [];
    throw error;
  }
};

// Read file content as text
export const readTextFile = async (fileUri: string): Promise<string> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      const content = await WebStorage.getFile(fileUri);
      return content || '';
    }
    
    // Native implementation
    return await FileSystem.readAsStringAsync(fileUri);
  } catch (error) {
    console.error('Error reading text file:', error);
    throw error;
  }
};

// Write text to a file
export const writeTextFile = async (filename: string, content: string, subdirectory = ''): Promise<string> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      const key = `${subdirectory}/${filename}`;
      return WebStorage.saveFile(key, content);
    }
    
    // Native implementation
    const directory = STORAGE_DIRECTORY + (subdirectory ? `${subdirectory}/` : '');
    await ensureDirectoryExists(directory);
    
    const fileUri = directory + filename;
    await FileSystem.writeAsStringAsync(fileUri, content);
    
    return fileUri;
  } catch (error) {
    console.error('Error writing text file:', error);
    throw error;
  }
};

// Get file info
export const getFileInfo = async (fileUri: string): Promise<any> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      const content = await WebStorage.getFile(fileUri);
      return {
        exists: content !== null,
        isDirectory: false,
        size: content ? content.length : 0,
        uri: fileUri,
        modificationTime: Date.now(),
      };
    }
    
    // Native implementation
    return await FileSystem.getInfoAsync(fileUri, { size: true, md5: true });
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

// Create a directory
export const createDirectory = async (directoryName: string): Promise<string> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      return directoryName;
    }
    
    // Native implementation
    const directory = STORAGE_DIRECTORY + directoryName;
    await ensureDirectoryExists(directory);
    return directory;
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

// Delete a directory
export const deleteDirectory = async (directoryName: string): Promise<void> => {
  try {
    // Web implementation
    if (Platform.OS === 'web') {
      const keys = await WebStorage.listKeys(directoryName);
      for (const key of keys) {
        await WebStorage.deleteFile(key);
      }
      return;
    }
    
    // Native implementation
    const directory = STORAGE_DIRECTORY + directoryName;
    const dirInfo = await FileSystem.getInfoAsync(directory);
    
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(directory, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting directory:', error);
    throw error;
  }
}; 