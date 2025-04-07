import * as FileSystem from 'expo-file-system';
import { createDirectory } from './fileStorage';

// Base storage directory
const STORAGE_DIRECTORY = FileSystem.documentDirectory + 'storage/';

// Subdirectories to create for organizing files
const REQUIRED_DIRECTORIES = [
  'attachments',
  'deliverables',
  'profiles',
  'temp'
];

/**
 * Initializes all required storage directories
 * Should be called when the app starts
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    console.log('Initializing storage directories...');
    
    // Ensure the base storage directory exists
    const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(STORAGE_DIRECTORY, { intermediates: true });
    }
    
    // Create all required subdirectories
    for (const dir of REQUIRED_DIRECTORIES) {
      await createDirectory(dir);
    }
    
    console.log('Storage directories initialized successfully!');
  } catch (error) {
    console.error('Error initializing storage directories:', error);
    throw error;
  }
};

/**
 * Gets the current storage usage information
 * @returns Object containing usage statistics
 */
export const getStorageInfo = async (): Promise<{ 
  directories: string[], 
  totalFiles: number 
}> => {
  try {
    const directories = [...REQUIRED_DIRECTORIES];
    let totalFiles = 0;
    
    // Count files in each directory
    for (const dir of directories) {
      const dirPath = STORAGE_DIRECTORY + dir;
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(dirPath);
        totalFiles += files.length;
      }
    }
    
    return { directories, totalFiles };
  } catch (error) {
    console.error('Error getting storage info:', error);
    throw error;
  }
}; 