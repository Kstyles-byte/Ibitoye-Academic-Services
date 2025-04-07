import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Base storage directory
const STORAGE_DIRECTORY = FileSystem.documentDirectory + 'storage/';

// Ensure the storage directory exists
const ensureDirectoryExists = async (directory: string) => {
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
};

// Save a file locally and return the local URI
export const saveFileLocally = async (fileUri: string, filename: string, subdirectory = ''): Promise<string> => {
  try {
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
    const directory = STORAGE_DIRECTORY + (subdirectory ? `${subdirectory}/` : '');
    await ensureDirectoryExists(directory);
    
    return await FileSystem.readDirectoryAsync(directory);
  } catch (error) {
    console.error('Error listing local files:', error);
    throw error;
  }
};

// Read file content as text
export const readTextFile = async (fileUri: string): Promise<string> => {
  try {
    return await FileSystem.readAsStringAsync(fileUri);
  } catch (error) {
    console.error('Error reading text file:', error);
    throw error;
  }
};

// Write text to a file
export const writeTextFile = async (filename: string, content: string, subdirectory = ''): Promise<string> => {
  try {
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
export const getFileInfo = async (fileUri: string): Promise<FileSystem.FileInfo> => {
  try {
    return await FileSystem.getInfoAsync(fileUri, { size: true, md5: true });
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

// Create a directory
export const createDirectory = async (directoryName: string): Promise<string> => {
  try {
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