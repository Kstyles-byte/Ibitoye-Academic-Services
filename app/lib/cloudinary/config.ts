import { Platform } from 'react-native';

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'dnciovhw0',
  apiKey: '422521143425452',
  apiSecret: 'QpMx_pS9MPAADZa2C14Ycj_0C1E',
  uploadPreset: 'academic_lessons', // Make sure this matches exactly with the preset created in Cloudinary console
  useUploadPreset: true, // Set to false to use API key/secret instead of upload preset
};

// Define upload folder paths
export const UPLOAD_FOLDERS = {
  ATTACHMENTS: 'attachments',
  DELIVERABLES: 'deliverables',
  PROFILES: 'profiles',
  TEMP: 'temp',
};

// Define common file mime types mapping
export const FILE_TYPES = {
  // Document types
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
  txt: 'text/plain',
  rtf: 'application/rtf',
  
  // Spreadsheet types
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // Presentation types
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Image types
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  
  // Video types
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  
  // Other types
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
};

// Get Cloudinary URL for an asset
export const getCloudinaryUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`;
};

// Generate a unique filename with timestamp to avoid collisions
export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = new Date().getTime();
  const cleanedName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${timestamp}_${cleanedName}`;
};

// Extract file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Determine if a file is an image based on extension
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

// Determine if a file is a video based on extension
export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
};

// Determine if a file is a document based on extension
export const isDocumentFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
};

// Get full upload path including folder
export const getUploadPath = (folder: string, filename: string): string => {
  return `${folder}/${filename}`;
};

// Get the MIME type based on file extension
export const getMimeType = (filename: string): string => {
  const extension = getFileExtension(filename);
  return FILE_TYPES[extension as keyof typeof FILE_TYPES] || 'application/octet-stream';
}; 