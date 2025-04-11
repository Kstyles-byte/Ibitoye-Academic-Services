import { Platform } from 'react-native';
import { CLOUDINARY_CONFIG, generateUniqueFilename, getUploadPath, getMimeType } from './config';

interface UploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  resourceType: string;
  size: number;
  originalFilename: string;
}

interface CloudinaryAsset {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  size: number;
  filename: string;
  createdAt: number;
}

/**
 * Generate a signature for Cloudinary upload
 * In production, this should be done server-side
 */
const generateSignature = async (folder: string, filename: string, timestamp: number): Promise<string> => {
  try {
    // Create all parameters to sign
    const params: Record<string, string> = {
      folder: folder,
      timestamp: timestamp.toString(),
    };
    
    // Sort parameters alphabetically by key as required by Cloudinary
    const sortedKeys = Object.keys(params).sort();
    const paramPairs = sortedKeys.map(key => `${key}=${params[key]}`);
    
    // Build the string to sign 
    // Format: param1=value1&param2=value2&...&apiSecret
    const stringToSign = paramPairs.join('&') + CLOUDINARY_CONFIG.apiSecret;
    
    console.log('Signing string:', stringToSign);
    
    // Generate SHA1 hash
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(stringToSign);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('Generated signature:', signature);
      return signature;
    }
    
    // Fallback (not secure)
    console.warn('Secure signature generation not available');
    throw new Error('Secure signature generation not available - cannot create signed upload');
  } catch (error) {
    console.error('Error generating signature:', error);
    throw new Error('Failed to generate signature for Cloudinary upload');
  }
};

// Determine the appropriate upload endpoint based on file type
const getUploadEndpoint = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(extension)) {
    return 'image';
  }
  
  // Video files
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
    return 'video';
  }
  
  // All other files (documents, etc.)
  return 'raw';
};

/**
 * Upload a file to Cloudinary
 * @param uri Local file URI or File object for web
 * @param filename Original filename
 * @param folder Folder to store in (e.g., 'attachments')
 * @returns CloudinaryAsset object with file details
 */
export const uploadToCloudinary = async (
  uri: string | File,
  filename: string,
  folder: string
): Promise<CloudinaryAsset> => {
  try {
    console.log(`Uploading to Cloudinary with preset: ${CLOUDINARY_CONFIG.uploadPreset}`);
    console.log(`Using cloud name: ${CLOUDINARY_CONFIG.cloudName}`);
    
    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename(filename);
    
    // Get mime type based on file extension
    const contentType = getMimeType(filename);
    console.log(`Detected content type: ${contentType} for file: ${filename}`);
    
    // Create form data for the upload
    const formData = new FormData();
    
    // Handle the file differently based on platform and type
    if (Platform.OS === 'web') {
      // For web platform
      if (uri instanceof File) {
        // If passed a File object directly (from web file input)
        formData.append('file', uri, uniqueFilename);
      } else if (typeof uri === 'string') {
        // For string URIs on web
        if (uri.startsWith('data:') || uri.startsWith('blob:')) {
          // For data: URLs, convert to blob
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            formData.append('file', blob, uniqueFilename);
          } catch (error) {
            console.error('Error converting URI to blob:', error);
            throw new Error('Failed to process the file for upload');
          }
        } else if (uri.includes('://')) {
          // For other URLs (like local file://), we need to use fetch
          formData.append('file', uri);
        } else {
          throw new Error(`Unsupported file source: ${typeof uri}`);
        }
      } else {
        throw new Error(`Unsupported file source: ${typeof uri}`);
      }
    } else {
      // For native platforms (iOS, Android)
      if (typeof uri === 'string') {
        formData.append('file', {
          uri,
          type: contentType, // Use the detected content type
          name: uniqueFilename,
        } as any);
      } else {
        // This should not happen in native platforms, but just in case
        console.warn('Received non-string URI in native platform. This is unexpected.');
        formData.append('file', uri);
      }
    }
    
    // Add the required parameters for Cloudinary
    if (CLOUDINARY_CONFIG.useUploadPreset) {
      // Use upload preset (unsigned upload)
      console.log(`Using unsigned upload with preset: ${CLOUDINARY_CONFIG.uploadPreset}`);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    } else {
      // Use API key and generate a signature (signed upload)
      console.log('Using signed upload with API key');
      const timestamp = Math.round(new Date().getTime() / 1000);
      formData.append('timestamp', `${timestamp}`);
      formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
      
      // Calculate signature (this would ideally be done server-side)
      // For demo purposes only - in production, should be done server-side
      try {
        console.log(`Generating signature for folder: ${folder}, filename: ${uniqueFilename}`);
        const signature = await generateSignature(folder, uniqueFilename, timestamp);
        console.log(`Generated signature: ${signature}`);
        formData.append('signature', signature);
      } catch (error) {
        console.error('Failed to generate signature:', error);
        throw new Error('Error preparing upload: Failed to generate signature');
      }
    }
    
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
    formData.append('folder', folder);
    
    // Log all form data
    console.log('Form data entries:');
    if (formData.entries) {
      for (const pair of formData.entries()) {
        if (pair[0] === 'file') {
          console.log('file: [binary data]');
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }
    }
    
    // Determine the appropriate upload endpoint based on file type
    const resourceType = getUploadEndpoint(filename);
    console.log(`Using upload endpoint: ${resourceType}/upload for file: ${filename}`);
    
    // Use the appropriate upload endpoint based on file type
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
    
    // Upload to Cloudinary with proper CORS settings
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
    });
    
    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || `Server responded with ${response.status}: ${response.statusText}`;
      } catch (e) {
        errorMessage = `Server responded with ${response.status}: ${response.statusText}`;
      }
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    // Return CloudinaryAsset object
    return {
      publicId: data.public_id,
      url: data.url,
      secureUrl: data.secure_url,
      format: data.format,
      resourceType: data.resource_type,
      size: data.bytes,
      filename: uniqueFilename,
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the asset to delete
 * @returns Success status
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // For security reasons, we should use a server-side function to delete
    // as it requires the API secret. However, for demo purposes, we're
    // including a client-side implementation.
    
    // Build the authentication signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Note: In a production app, this signature should be generated on the server
    // This is just for demonstration purposes
    const signature = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
    const encodedSignature = await generateSHA1(signature);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('signature', encodedSignature);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Get file details from Cloudinary
 * Currently a placeholder - would need to be implemented with Cloudinary Admin API
 * which requires server-side implementation for security
 */
export const getFileDetails = async (publicId: string): Promise<any> => {
  // In a real application, you would call your backend to get file details
  // as this requires the API secret
  console.warn('getFileDetails: This function requires server-side implementation');
  
  return {
    exists: true,
    publicId,
    url: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`,
  };
};

/**
 * Generate a SHA1 hash for Cloudinary authentication
 * This is a simplified version for demo purposes
 */
const generateSHA1 = async (message: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without crypto.subtle
  console.warn('Secure SHA-1 generation not available');
  return message; // This is NOT secure, just a fallback
};

/**
 * Generate a Cloudinary URL for an image with transformations
 */
export const getImageUrl = (publicId: string, options: { width?: number, height?: number, crop?: string } = {}): string => {
  let transformations = '';
  
  if (options.width || options.height || options.crop) {
    const transformParts = [];
    if (options.width) transformParts.push(`w_${options.width}`);
    if (options.height) transformParts.push(`h_${options.height}`);
    if (options.crop) transformParts.push(`c_${options.crop}`);
    transformations = transformParts.join(',') + '/';
  }
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformations}${publicId}`;
};

/**
 * Store Cloudinary asset metadata in local storage for future reference
 */
export const storeAssetMetadata = (asset: CloudinaryAsset): void => {
  try {
    const storedAssets = getStoredAssets();
    storedAssets.push(asset);
    localStorage.setItem('cloudinary_assets', JSON.stringify(storedAssets));
  } catch (error) {
    console.warn('Failed to store asset metadata locally', error);
  }
};

/**
 * Get all stored Cloudinary assets from local storage
 */
export const getStoredAssets = (): CloudinaryAsset[] => {
  try {
    const assets = localStorage.getItem('cloudinary_assets');
    return assets ? JSON.parse(assets) : [];
  } catch (error) {
    console.warn('Failed to retrieve stored assets', error);
    return [];
  }
};

/**
 * Get all stored assets for a specific folder
 */
export const getStoredAssetsForFolder = (folder: string): CloudinaryAsset[] => {
  const assets = getStoredAssets();
  return assets.filter(asset => asset.publicId.startsWith(folder + '/'));
};

/**
 * Remove asset metadata from local storage
 */
export const removeAssetMetadata = (publicId: string): void => {
  try {
    const storedAssets = getStoredAssets();
    const updatedAssets = storedAssets.filter(asset => asset.publicId !== publicId);
    localStorage.setItem('cloudinary_assets', JSON.stringify(updatedAssets));
  } catch (error) {
    console.warn('Failed to remove asset metadata locally', error);
  }
}; 