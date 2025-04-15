import { Timestamp } from '../db/types';

/**
 * Format a timestamp to a human-readable date and time
 */
export const formatDate = (timestamp: Timestamp): string => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get a relative time string (e.g., "2 minutes ago")
 */
export const getRelativeTime = (timestamp: Timestamp): string => {
  if (!timestamp) return 'N/A';
  
  const now = new Date();
  const date = new Date(timestamp.seconds * 1000);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}; 