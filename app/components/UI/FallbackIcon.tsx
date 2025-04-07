import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FallbackIconProps {
  name?: string;
  size?: number;
  color?: string;
  [key: string]: any;
}

/**
 * A fallback icon component that displays when the actual icon fails to load
 * This helps ensure the UI doesn't break when icons have issues
 */
export const FallbackIcon: React.FC<FallbackIconProps> = ({
  name = 'icon',
  size = 24,
  color = '#666',
  ...props
}) => {
  // Style based on provided props
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  };
  
  // Get first letter for the fallback
  const letter = name.charAt(0).toUpperCase();
  
  // Text style based on provided props
  const textStyle = {
    fontSize: size * 0.5,
    color,
  };
  
  return (
    <View style={[styles.container, containerStyle]} {...props}>
      <Text style={[styles.text, textStyle]}>{letter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});

export default FallbackIcon; 