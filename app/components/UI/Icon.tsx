import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants';

// Define the type for Lucide icons
type LucideIconType = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
  style?: ViewStyle;
}>;

export type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = Colors.dark,
  style,
  containerStyle,
}) => {
  // Check if the icon exists in Lucide
  const IconComponent = (LucideIcons[name] || LucideIcons.HelpCircle) as LucideIconType;

  return (
    <View style={[styles.container, containerStyle]}>
      <IconComponent size={size} color={color} strokeWidth={2} style={style} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Helper function to map Ionicons names to Lucide names
export const mapIoniconToLucide = (ioniconName: string): IconName => {
  const iconMap: Record<string, IconName> = {
    // Navigation and UI
    'menu-outline': 'Menu',
    'menu': 'Menu',
    'close': 'X',
    'close-outline': 'X',
    'close-circle': 'XCircle',
    'chevron-forward': 'ChevronRight',
    'chevron-back': 'ChevronLeft',
    'arrow-back': 'ArrowLeft',
    'log-out-outline': 'LogOut',
    'log-out': 'LogOut',
    'chevron-up': 'ChevronUp',
    'chevron-down': 'ChevronDown',
    'options': 'Settings',
    'options-outline': 'Settings',
    'eye': 'Eye',
    'eye-outline': 'Eye',
    'wallet': 'Wallet',
    'wallet-outline': 'Wallet',
    
    // Common actions
    'search': 'Search',
    'search-outline': 'Search',
    'add': 'Plus',
    'add-outline': 'Plus',
    'trash': 'Trash',
    'trash-outline': 'Trash',
    'settings': 'Settings',
    'settings-outline': 'Settings',
    
    // Home and dashboard
    'home': 'Home',
    'home-outline': 'Home',
    'grid': 'Grid',
    'grid-outline': 'Grid',
    
    // Communication
    'mail': 'Mail',
    'mail-outline': 'Mail',
    'chatbubbles': 'MessageSquare',
    'chatbubbles-outline': 'MessageSquare',
    'chatbubble': 'MessageCircle',
    'chatbubble-outline': 'MessageCircle',
    'call': 'Phone',
    'call-outline': 'Phone',
    
    // Status indicators
    'checkmark': 'Check',
    'checkmark-outline': 'Check',
    'checkmark-circle': 'CheckCircle',
    'checkmark-circle-outline': 'CheckCircle',
    'alert': 'AlertTriangle',
    'alert-outline': 'AlertTriangle',
    'information': 'Info',
    'information-outline': 'Info',
    'notifications': 'Bell',
    'notifications-outline': 'Bell',
    
    // Business and finance
    'briefcase': 'Briefcase',
    'briefcase-outline': 'Briefcase',
    'cash': 'DollarSign',
    'cash-outline': 'DollarSign',
    
    // Time and calendar
    'time': 'Clock',
    'time-outline': 'Clock',
    'calendar': 'Calendar',
    'calendar-outline': 'Calendar',
    
    // Files and documents
    'document': 'File',
    'document-outline': 'File',
    'document-text': 'FileText',
    'document-text-outline': 'FileText',
    'image-outline': 'Image',
    'image': 'Image',
    'videocam-outline': 'Video',
    'videocam': 'Video',
    'musical-notes-outline': 'Music',
    'musical-notes': 'Music',
    'archive-outline': 'Archive',
    'archive': 'Archive',
    
    // Users and profiles
    'person': 'User',
    'person-outline': 'User',
    'person-add': 'UserPlus',
    'person-add-outline': 'UserPlus',
    'people': 'Users',
    'people-outline': 'Users',
    
    // Ratings and feedback
    'star': 'Star',
    'star-outline': 'Star',
    
    // Fallback
    'help-circle': 'HelpCircle',
    'help-circle-outline': 'HelpCircle'
  };

  // If the icon name doesn't exist in our mapping, log a warning and use a fallback
  if (!iconMap[ioniconName]) {
    console.warn(`Icon mapping not found for: ${ioniconName}. Using HelpCircle as fallback.`);
  }

  return iconMap[ioniconName] || 'HelpCircle';
};

export default Icon; 