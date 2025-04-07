import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import FallbackIcon from './FallbackIcon';
import { LucideProps } from 'lucide-react-native';
import { SVGIcon, SVG_ICONS, debugSVGIcons } from './SVGIcons';

// Add TypeScript declarations for window properties
declare global {
  interface Window {
    _debugIconsInitialized?: boolean;
    logIconEvent?: (event: string, details: any) => void;
    debugSvgIconSystem?: () => string;
  }
}

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
  
  // Initialize debug tools if needed
  if (Platform.OS === 'web' && typeof window !== 'undefined' && !window._debugIconsInitialized) {
    window._debugIconsInitialized = true;
    if (typeof window.logIconEvent === 'function') {
      window.logIconEvent('SafeIconRendering', { 
        available: Object.keys(SVG_ICONS).length
      });
    }
  }
  
  // On web, use direct SVG rendering to avoid library loading issues
  if (Platform.OS === 'web') {
    const iconName = String(name);
    
    // Attempt to render an SVG icon directly
    try {
      if (iconName in SVG_ICONS) {
        if (typeof window !== 'undefined' && typeof window.logIconEvent === 'function') {
          window.logIconEvent('SVGIconUsed', { name: iconName });
        }
        return (
          <SVGIcon 
            name={iconName} 
            size={size} 
            color={color} 
            strokeWidth={strokeWidth} 
          />
        );
      } else {
        if (typeof window !== 'undefined' && typeof window.logIconEvent === 'function') {
          window.logIconEvent('SVGIconMissing', { name: iconName });
        }
        console.warn(`[SAFE_ICON] SVG not found for ${iconName}, using fallback`);
      }
    } catch (e) {
      console.error(`[SAFE_ICON] Error rendering SVG for ${iconName}:`, e);
      if (typeof window !== 'undefined' && typeof window.logIconEvent === 'function') {
        window.logIconEvent('SVGIconError', { name: iconName, error: String(e) });
      }
    }
    
    // If we couldn't use an SVG, use the fallback
    if (useFallback) {
      return (
        <FallbackIcon
          name={iconName}
          size={size}
          color={color}
          style={containerStyle}
          {...props}
        />
      );
    }
    return null;
  }
  
  // For native platforms, continue using Lucide as before
  let IconComponent: React.ComponentType<LucideProps> | null = null;
  
  try {
    // @ts-ignore - Dynamically get the icon component
    IconComponent = LucideIcons[name];
    
    if (!IconComponent) {
      console.warn(`[SAFE_ICON] Icon "${String(name)}" not found in Lucide icons`);
    }
  } catch (error) {
    console.error(`[SAFE_ICON] Error loading icon ${String(name)}:`, error);
    setHasError(true);
  }
  
  // If the icon failed to load or doesn't exist, show fallback
  if (hasError || !IconComponent) {
    if (useFallback) {
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
  
  // Render the actual Lucide icon component for native platforms
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
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

// Create a helper for debugging icons
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // @ts-ignore - Add debug method to window
  window.debugSvgIconSystem = () => {
    console.log('[SAFE_ICON] Starting SVG icon system debug');
    debugSVGIcons();
    
    // Render a test icon
    const icons = Object.keys(SVG_ICONS);
    console.log(`[SAFE_ICON] Available icons: ${icons.length}`);
    
    if (typeof document !== 'undefined') {
      // Create a test container
      const testContainer = document.createElement('div');
      testContainer.id = 'icon-test-container';
      testContainer.style.position = 'fixed';
      testContainer.style.top = '10px';
      testContainer.style.left = '10px';
      testContainer.style.backgroundColor = 'rgba(255,255,255,0.9)';
      testContainer.style.padding = '10px';
      testContainer.style.borderRadius = '5px';
      testContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      testContainer.style.zIndex = '9999';
      
      // Add a title
      const title = document.createElement('h3');
      title.textContent = 'Icon Test Panel';
      title.style.margin = '0 0 10px 0';
      testContainer.appendChild(title);
      
      // Add a close button
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '5px';
      closeButton.style.right = '5px';
      closeButton.onclick = () => document.body.removeChild(testContainer);
      testContainer.appendChild(closeButton);
      
      // Display icons
      const iconGrid = document.createElement('div');
      iconGrid.style.display = 'grid';
      iconGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
      iconGrid.style.gap = '10px';
      
      icons.slice(0, 20).forEach(iconName => {
        const iconWrapper = document.createElement('div');
        iconWrapper.style.textAlign = 'center';
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        // Get path data and split into separate paths
        const pathData = SVG_ICONS[iconName];
        const paths = pathData.split(' M').map((p, i) => i === 0 ? p : `M${p}`);
        
        paths.forEach(d => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', d);
          svg.appendChild(path);
        });
        
        iconWrapper.appendChild(svg);
        
        // Add icon name
        const label = document.createElement('div');
        label.textContent = iconName;
        label.style.fontSize = '10px';
        label.style.marginTop = '4px';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
        iconWrapper.appendChild(label);
        
        iconGrid.appendChild(iconWrapper);
      });
      
      testContainer.appendChild(iconGrid);
      document.body.appendChild(testContainer);
      
      return "Icon test panel opened";
    }
    
    return "Unable to create test panel (document not available)";
  };
}

export default SafeIcon; 