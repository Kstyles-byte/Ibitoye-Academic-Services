// Re-export everything from the Cloudinary files for easier imports
export * from './config';
export * from './cloudinaryService';
export * from './fileStorage';

// Export main storage functions with their original names to maintain compatibility
import { 
  saveFileLocally, 
  deleteLocalFile, 
  listLocalFiles, 
  getFileInfo, 
  initializeStorage 
} from './fileStorage';

export {
  saveFileLocally,
  deleteLocalFile,
  listLocalFiles,
  getFileInfo,
  initializeStorage
}; 