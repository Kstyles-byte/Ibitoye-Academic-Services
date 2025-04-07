import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { SVG_ICONS } from './SVGIcons';

// Add TypeScript declaration for window.debugIcons
declare global {
  interface Window {
    debugIcons?: () => void;
  }
}

interface DebugInfoProps {
  show?: boolean;
}

/**
 * Debug component to show diagnostics about icon rendering
 */
export const DebugInfo: React.FC<DebugInfoProps> = ({ show = false }) => {
  // Skip this component if not debugging or not on web
  if (!show || Platform.OS !== 'web') {
    return null;
  }
  
  // Log debug info on mount
  useEffect(() => {
    console.log('[DEBUG_INFO] Component mounted');
    logIconInfo();
    // Add a small delay to check after initial render
    setTimeout(logIconInfo, 1000);
  }, []);
  
  // Function to log icon information
  const logIconInfo = () => {
    console.log('[DEBUG_INFO] Available SVG icons:', Object.keys(SVG_ICONS));
    
    if (typeof document !== 'undefined') {
      const svgElements = document.querySelectorAll('svg');
      console.log(`[DEBUG_INFO] Found ${svgElements.length} SVG elements in DOM`);
      
      if (typeof window !== 'undefined' && window.debugIcons) {
        window.debugIcons();
      }
    }
  };
  
  // Handler for debug button click
  const handleDebugClick = () => {
    console.log('[DEBUG_INFO] Manual debug triggered');
    logIconInfo();
    
    // Create test SVG
    if (typeof document !== 'undefined') {
      const testSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      testSvg.setAttribute('width', '24');
      testSvg.setAttribute('height', '24');
      testSvg.setAttribute('viewBox', '0 0 24 24');
      testSvg.setAttribute('fill', 'none');
      testSvg.setAttribute('stroke', 'currentColor');
      testSvg.setAttribute('stroke-width', '2');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z');
      
      testSvg.appendChild(path);
      document.body.appendChild(testSvg);
      
      console.log('[DEBUG_INFO] Created test SVG:', testSvg);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Icon Debug Info</Text>
      <Text style={styles.info}>Platform: {Platform.OS}</Text>
      <Text style={styles.info}>SVG Icons: {Object.keys(SVG_ICONS).length} available</Text>
      <Pressable style={styles.button} onPress={handleDebugClick}>
        <Text style={styles.buttonText}>Debug Icons</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 9999,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  info: {
    color: 'white',
    fontSize: 12,
    marginBottom: 3,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 3,
    marginTop: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 