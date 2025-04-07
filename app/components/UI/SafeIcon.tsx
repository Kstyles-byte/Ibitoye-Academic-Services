import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { SVGIcon, SVG_ICONS } from './SVGIcons';
import FallbackIcon from './FallbackIcon';

/**
 * Properties for the SafeIcon component
 */
export interface SafeIconProps {
  /**
   * Name of the icon from Lucide icons
   */
  name: string;
  /**
   * Size of the icon (default: 24)
   */
  size?: number;
  /**
   * Color of the icon (default: currentColor)
   */
  color?: string;
  /**
   * Stroke width of the icon (default: 2)
   */
  strokeWidth?: number;
  /**
   * Additional style for the icon container
   */
  containerStyle?: any;
  /**
   * Whether to show a fallback if the icon fails to load
   */
  useFallback?: boolean;
  /**
   * Additional props to pass to the icon
   */
  [key: string]: any;
}

/**
 * A safe wrapper for icons that handles errors and provides fallbacks
 * Will use inline SVGs on web to avoid issues with Lucide library loading
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
  
  // On web, use direct SVG rendering for reliability
  if (Platform.OS === 'web') {
    // Check if we have this icon in our SVG definitions
    if (name in SVG_ICONS) {
      return (
        <SVGIcon 
          name={name} 
          size={size} 
          color={color}
          strokeWidth={strokeWidth} 
          containerStyle={containerStyle}
          {...props}
        />
      );
    }
    
    // If no SVG definition and fallback enabled, use the fallback
    if (useFallback) {
      return (
        <FallbackIcon
          size={size}
          color={color}
          containerStyle={containerStyle}
          {...props}
        />
      );
    }
    
    // If no fallback, return null (no icon)
    return null;
  }
  
  // For native platforms, use the Lucide components directly
  try {
    // @ts-ignore - Lucide icon components are valid React components
    const IconComponent = LucideIcons[name];
    
    if (!IconComponent) {
      if (useFallback) {
        return (
          <FallbackIcon
            size={size}
            color={color}
            containerStyle={containerStyle}
            {...props}
          />
        );
      }
      return null;
    }
    
    return (
      <View style={[styles.container, containerStyle]}>
        <IconComponent
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          {...props}
        />
      </View>
    );
  } catch (error) {
    // If there's an error and fallback is enabled, use the fallback
    if (useFallback) {
      return (
        <FallbackIcon
          size={size}
          color={color}
          containerStyle={containerStyle}
          {...props}
        />
      );
    }
    
    // Otherwise return null (no icon)
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default SafeIcon; 