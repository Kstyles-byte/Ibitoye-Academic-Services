import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconWrapperProps {
  name: string;
  size: number;
  color: string;
}

/**
 * IconWrapper component that handles icon rendering across platforms
 * Renders Ionicons on native platforms, and uses the Ionicons web equivalent on web
 * Includes a fallback to Font Awesome icons if Ionicons fails to load on web
 */
const IconWrapper: React.FC<IconWrapperProps> = ({ name, size, color }) => {
  // For native platforms, use the Ionicons component as usual
  if (Platform.OS !== 'web') {
    return <Ionicons name={name as any} size={size} color={color} />;
  }

  // State to track which icon library to use
  const [iconLibrary, setIconLibrary] = useState<'ionicons' | 'fontawesome' | 'emoji'>('ionicons');

  useEffect(() => {
    // Check which icon libraries are available on web
    if (Platform.OS === 'web') {
      // First check if Ionicons custom elements are available
      const ionIconsAvailable = typeof window !== 'undefined' && 
        window.customElements && 
        window.customElements.get('ion-icon');
      
      // Then check if Font Awesome is available by looking for its stylesheet
      const fontAwesomeAvailable = typeof document !== 'undefined' && 
        (document.querySelector('link[href*="font-awesome"]') !== null ||
         document.body.classList.contains('using-font-awesome-fallback'));
      
      if (ionIconsAvailable) {
        setIconLibrary('ionicons');
      } else if (fontAwesomeAvailable) {
        setIconLibrary('fontawesome');
      } else {
        // If neither is available, use emoji as ultimate fallback
        setIconLibrary('emoji');
      }
    }
  }, []);

  // Maps Ionicons names to equivalent Font Awesome class names
  const getFontAwesomeClass = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'document-text': 'fas fa-file-alt',
      'pencil': 'fas fa-pencil-alt',
      'newspaper': 'fas fa-newspaper',
      'school': 'fas fa-graduation-cap',
      'code-slash': 'fas fa-code',
      'clipboard': 'fas fa-clipboard',
      'checkmark-circle': 'fas fa-check-circle',
      'close-circle': 'fas fa-times-circle',
      'help-circle': 'fas fa-question-circle',
      'grid-outline': 'fas fa-th',
      'home-outline': 'fas fa-home',
      'briefcase-outline': 'fas fa-briefcase',
      'menu-outline': 'fas fa-bars',
      'close': 'fas fa-times',
      'search': 'fas fa-search',
      'add': 'fas fa-plus',
      'trash': 'fas fa-trash',
      'alert-circle': 'fas fa-exclamation-circle',
      'time': 'fas fa-clock',
      'person': 'fas fa-user',
      'mail': 'fas fa-envelope',
      'call': 'fas fa-phone',
      'location': 'fas fa-map-marker-alt',
      // Add more mappings as needed
    };
    
    return iconMap[iconName] || 'fas fa-question';
  };

  // Maps icon names to emoji fallbacks
  const getEmojiFallback = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'document-text': '📄',
      'pencil': '✏️',
      'newspaper': '📰',
      'school': '🎓',
      'code-slash': '💻',
      'clipboard': '📋',
      'checkmark-circle': '✅',
      'close-circle': '❌',
      'help-circle': '❓',
      'grid-outline': '🔲',
      'home-outline': '🏠',
      'briefcase-outline': '💼',
      'menu-outline': '☰',
      'close': '✖️',
      'search': '🔍',
      'add': '➕',
      'trash': '🗑️',
      'alert-circle': '⚠️',
      'time': '🕒',
      'person': '👤',
      'mail': '✉️',
      'call': '📞',
      'location': '📍',
      // Add more mappings as needed
    };
    
    return iconMap[iconName] || '❔';
  };

  // Maps Ionicons names to web Ionicons names (some might differ)
  const getIonIconName = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'document-text': 'document-text',
      'pencil': 'pencil',
      'newspaper': 'newspaper',
      'school': 'school',
      'code-slash': 'code-slash',
      'clipboard': 'clipboard',
      'checkmark-circle': 'checkmark-circle',
      'close-circle': 'close-circle',
      'help-circle': 'help-circle',
      'grid-outline': 'grid-outline',
      'home-outline': 'home-outline',
      'briefcase-outline': 'briefcase-outline',
      'menu-outline': 'menu-outline',
      'close': 'close',
      // Add more mappings if needed
    };

    return iconMap[iconName] || iconName;
  };

  // Render based on the available icon library
  switch (iconLibrary) {
    case 'ionicons':
      const webIconName = getIonIconName(name);
      
      // Use dangerouslySetInnerHTML to create the ion-icon element
      return (
        <View style={styles.container}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{
              __html: `<ion-icon name="${webIconName}" style="font-size: ${size}px; color: ${color};"></ion-icon>`
            }}
          />
        </View>
      );
    
    case 'fontawesome':
      const faClass = getFontAwesomeClass(name);
      
      return (
        <View style={styles.container}>
          <i 
            className={faClass}
            style={{
              fontSize: `${size}px`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </View>
      );
    
    case 'emoji':
      // Ultimate fallback - use emoji
      const emoji = getEmojiFallback(name);
      
      return (
        <View style={styles.container}>
          <span
            style={{
              fontSize: `${size}px`,
              lineHeight: `${size}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {emoji}
          </span>
        </View>
      );
    
    default:
      // If all else fails, return an empty view
      return <View style={styles.container} />;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default IconWrapper; 