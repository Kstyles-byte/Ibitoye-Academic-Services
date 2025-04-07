import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

type ColorScheme = 'light' | 'dark';

/**
 * This hook handles color scheme detection and management.
 * It returns the current color scheme ('light' or 'dark') and updates when the device preference changes.
 */
export function useColorScheme(): ColorScheme {
  // Get the device's color scheme preference
  const deviceColorScheme = useDeviceColorScheme();
  
  // Initialize with the device preference or default to 'light' if null
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    (deviceColorScheme as ColorScheme) || 'light'
  );

  // Update the color scheme when the device preference changes
  useEffect(() => {
    if (deviceColorScheme) {
      setColorScheme(deviceColorScheme as ColorScheme);
    }
  }, [deviceColorScheme]);

  return colorScheme;
} 