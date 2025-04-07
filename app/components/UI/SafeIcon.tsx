import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import FallbackIcon from './FallbackIcon';
import { LucideProps } from 'lucide-react-native';

interface SafeIconProps {
  // Name of the icon to render
  name: keyof typeof LucideIcons;
  // Size of the icon
  size?: number;
  // Color of the icon
  color?: string;
  // Stroke width for the icon
  strokeWidth?: number;
  // Additional container styles
  containerStyle?: any;
  // Show letter fallback if the icon fails
  useFallback?: boolean;
  // Any additional props
  [key: string]: any;
}

/**
 * A safe wrapper for Lucide icons that handles errors and provides fallbacks
 */
export const SafeIcon: React.FC<SafeIconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  containerStyle,
  useFallback = true,
  ...props
}) => {
  // Track if the icon has failed to load
  const [hasError, setHasError] = useState(false);
  
  // Get the actual icon component
  let IconComponent: React.ComponentType<LucideProps> | null = null;
  
  try {
    if (Platform.OS === 'web') {
      console.log(`[SAFE_ICON] Trying to load ${String(name)} icon`);
    }
    
    // @ts-ignore - Dynamically get the icon component
    IconComponent = LucideIcons[name];
    
    if (!IconComponent && Platform.OS === 'web') {
      console.warn(`[SAFE_ICON] Icon "${String(name)}" not found in Lucide icons`);
    }
  } catch (error) {
    if (Platform.OS === 'web') {
      console.error(`[SAFE_ICON] Error loading icon ${String(name)}:`, error);
    }
    setHasError(true);
  }
  
  // If the icon failed to load or doesn't exist, show fallback
  if (hasError || !IconComponent) {
    if (useFallback) {
      if (Platform.OS === 'web') {
        console.log(`[SAFE_ICON] Using fallback for ${String(name)}`);
      }
      return (
        <FallbackIcon
          name={String(name)}
          size={size}
          color={color}
          style={containerStyle}
          {...props}
        />
      );
    }
    return null;
  }
  
  // Error boundary for icon rendering
  const handleError = (error: Error) => {
    console.error(`[SAFE_ICON] Error rendering ${String(name)}:`, error);
    setHasError(true);
    return null;
  };
  
  // Render the actual icon component with error handling
  return (
    <View style={[styles.container, containerStyle]}>
      {Platform.OS === 'web' ? (
        // On web, add extra wrapper div for better compatibility
        <div className="icon-wrapper" data-icon-name={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconComponent
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            {...props}
          />
        </div>
      ) : (
        // On native platforms, render directly
        <IconComponent
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          {...props}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default SafeIcon; 