// Export all commonly used icons from Lucide
// This makes it easier to use icons consistently across the app

import React from 'react';
import { Platform } from 'react-native';

// Debug helper
const logIconImport = (name: string) => {
  if (Platform.OS === 'web') {
    console.log(`[ICON] Importing ${name} icon`);
  }
};

// Import icons with logging for debugging
import {
  // Navigation icons
  Home,
  LayoutGrid,
  Grid,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  LogIn,
  Settings,
  User,
  Users,
  
  // File icons
  File,
  FileText,
  Image as ImageIcon, // renamed to avoid conflict with RN Image
  Video,
  Music,
  Archive,
  Trash,
  Download,
  Upload,
  
  // Business icons
  Briefcase,
  CreditCard,
  DollarSign,
  Calendar,
  
  // Communication icons
  Mail,
  MessageSquare,
  Phone,
  Bell,
  
  // Action icons
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  Search,
  
  // Other icons
  Heart,
  Star,
  BookOpen,
  Bookmark,
  Coffee,
  Clock,
  
  // Common props type
  LucideProps
} from 'lucide-react-native';

// Log import completion for debugging
if (Platform.OS === 'web') {
  console.log('[ICONS] Successfully imported Lucide icons');
}

// Wrapper components to add better debugging
const createDebugIcon = (IconComponent: any, name: string) => {
  const DebugIcon = (props: LucideProps) => {
    if (Platform.OS === 'web') {
      console.log(`[ICON] Rendering ${name} icon`);
    }
    return <IconComponent {...props} />;
  };
  DebugIcon.displayName = `${name}Icon`;
  return DebugIcon;
};

// Create debuggable versions of icons
const DebugHome = createDebugIcon(Home, 'Home');
const DebugLayoutGrid = createDebugIcon(LayoutGrid, 'LayoutGrid');
const DebugGrid = createDebugIcon(Grid, 'Grid');
const DebugMenu = createDebugIcon(Menu, 'Menu');
const DebugX = createDebugIcon(X, 'X');
const DebugFile = createDebugIcon(File, 'File');
const DebugFileText = createDebugIcon(FileText, 'FileText');
const DebugImageIcon = createDebugIcon(ImageIcon, 'Image');
const DebugTrash = createDebugIcon(Trash, 'Trash');
const DebugBriefcase = createDebugIcon(Briefcase, 'Briefcase');

// Re-export all icons, using debug versions on web
export {
  // Navigation
  DebugHome as Home,
  DebugLayoutGrid as LayoutGrid,
  DebugGrid as Grid,
  DebugMenu as Menu,
  DebugX as X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  LogIn,
  Settings,
  User,
  Users,
  
  // File
  DebugFile as File,
  DebugFileText as FileText,
  DebugImageIcon as ImageIcon,
  Video,
  Music,
  Archive,
  DebugTrash as Trash,
  Download,
  Upload,
  
  // Business
  DebugBriefcase as Briefcase,
  CreditCard,
  DollarSign,
  Calendar,
  
  // Communication
  Mail,
  MessageSquare,
  Phone,
  Bell,
  
  // Action
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  Search,
  
  // Other
  Heart,
  Star,
  BookOpen,
  Bookmark,
  Coffee,
  Clock,
  
  // Types
  LucideProps
}; 