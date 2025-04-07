import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

// Define the props for our Icon component
interface IconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  color?: string;
  strokeWidth?: number;
  containerStyle?: any;
  [key: string]: any; // Allow additional props
}

/**
 * A wrapper component for Lucide icons that ensures consistent usage
 * across the application.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  containerStyle,
  ...rest
}) => {
  // Dynamically get the icon component from Lucide icons
  // @ts-ignore - Lucide icon components are valid React components
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <IconComponent 
        size={size} 
        color={color} 
        strokeWidth={strokeWidth}
        {...rest} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export type { IconProps }; 