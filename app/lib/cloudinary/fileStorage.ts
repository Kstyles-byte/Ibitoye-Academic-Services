import { Platform } from 'react-native';
import { uploadToCloudinary, deleteFromCloudinary, getFileDetails, getStoredAssetsForFolder, removeAssetMetadata, storeAssetMetadata } from './cloudinaryService';
import { UPLOAD_FOLDERS, generateUniqueFilename } from './config';

// In-memory storage for development fallback
const localStorageMap: Record<string, string> = {};

/**
 * Save a file to Cloudinary and return the file details
 * @param fileUri The local URI of the file or a File object (web)
 * @param filename The filename
 * @param subdirectory The folder to store in (e.g., 'attachments')
 * @returns The URL of the uploaded file
 */
export const saveFileToCloud = async (
  fileUri: string | File,
  filename: string,
  subdirectory = UPLOAD_FOLDERS.ATTACHMENTS
): Promise<string> => {
  try {
    // Upload to Cloudinary
    const asset = await uploadToCloudinary(fileUri, filename, subdirectory);
    
    // Store the asset metadata locally for future reference
    storeAssetMetadata(asset);
    
    // Return the secure URL
    return asset.secureUrl;
  } catch (error) {
    console.error('Error saving file to cloud:', error);
    
    // Fallback for development: Store locally in memory
    if (__DEV__) {
      console.warn('Using local storage fallback for development');
      const uniqueId = generateUniqueFilename(filename);
      const mockUrl = `local://${subdirectory}/${uniqueId}`;
      
      // Store the file URI in our memory map
      if (typeof fileUri === 'string') {
        localStorageMap[mockUrl] = fileUri;
      } else if (fileUri instanceof File) {
        // For File objects, store a created object URL
        const objectUrl = URL.createObjectURL(fileUri);
        localStorageMap[mockUrl] = objectUrl;
      }
      
      return mockUrl;
    }
    
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param fileUrl The URL of the file to delete
 */
export const deleteCloudFile = async (fileUrl: string): Promise<void> => {
  try {
    // Check if this is a local development URL
    if (fileUrl.startsWith('local://')) {
      if (__DEV__) {
        // Remove from local storage map
        delete localStorageMap[fileUrl];
        return;
      }
    }
    
    // Extract the public ID from the URL
    const publicId = extractPublicIdFromUrl(fileUrl);
    
    if (!publicId) {
      console.warn('Could not extract public ID from URL:', fileUrl);
      return;
    }
    
    // Delete from Cloudinary
    const success = await deleteFromCloudinary(publicId);
    
    if (success) {
      // Remove from local metadata storage
      removeAssetMetadata(publicId);
    }
  } catch (error) {
    console.error('Error deleting cloud file:', error);
    throw error;
  }
};

/**
 * List files in a directory in Cloudinary
 * Note: Since Cloudinary doesn't have a direct "list directory" endpoint for the client,
 * we're using locally stored metadata as a workaround.
 * @param subdirectory The folder to list files from
 * @returns Array of file URLs
 */
export const listCloudFiles = async (subdirectory = UPLOAD_FOLDERS.ATTACHMENTS): Promise<string[]> => {
  try {
    // Get stored assets for the folder
    const assets = getStoredAssetsForFolder(subdirectory);
    
    // Return the secure URLs
    return assets.map(asset => asset.secureUrl);
  } catch (error) {
    console.error('Error listing cloud files:', error);
    return [];
  }
};

/**
 * Get information about a file
 * @param fileUrl The URL of the file
 * @returns File information object
 */
export const getCloudFileInfo = async (fileUrl: string): Promise<any> => {
  try {
    // Extract the public ID from the URL
    const publicId = extractPublicIdFromUrl(fileUrl);
    
    if (!publicId) {
      throw new Error('Could not extract public ID from URL');
    }
    
    // Get file details from Cloudinary
    return await getFileDetails(publicId);
  } catch (error) {
    console.error('Error getting cloud file info:', error);
    throw error;
  }
};

/**
 * Helper function to extract the public ID from a Cloudinary URL
 * @param url The Cloudinary URL
 * @returns The public ID
 */
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Regular expression to extract the public ID from a Cloudinary URL
    // This handles both image/upload and video/upload URLs
    const regex = /\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Initialize Cloudinary storage
 * This is mostly a placeholder for API compatibility with the old storage module
 */
export const initializeCloudStorage = async (): Promise<void> => {
  console.log('Cloudinary storage initialized');
  
  // Set up development fallback
  if (__DEV__) {
    console.log('Development mode: Local storage fallback enabled');
  }
  
  return;
};

/**
 * Get storage information
 * This is mostly a placeholder for API compatibility with the old storage module
 */
export const getCloudStorageInfo = async (): Promise<{ folders: string[], totalFiles: number }> => {
  try {
    // Get all stored assets
    const attachments = getStoredAssetsForFolder(UPLOAD_FOLDERS.ATTACHMENTS);
    const deliverables = getStoredAssetsForFolder(UPLOAD_FOLDERS.DELIVERABLES);
    const profiles = getStoredAssetsForFolder(UPLOAD_FOLDERS.PROFILES);
    const temp = getStoredAssetsForFolder(UPLOAD_FOLDERS.TEMP);
    
    return {
      folders: Object.values(UPLOAD_FOLDERS),
      totalFiles: attachments.length + deliverables.length + profiles.length + temp.length
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      folders: Object.values(UPLOAD_FOLDERS),
      totalFiles: 0
    };
  }
};

// Export functions with names that match the old API for easier transition
export const saveFileLocally = saveFileToCloud;
export const deleteLocalFile = deleteCloudFile;
export const listLocalFiles = listCloudFiles;
export const getFileInfo = getCloudFileInfo;
export const initializeStorage = initializeCloudStorage; 