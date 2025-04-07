import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { SVG_ICONS } from './SVGIcons';

/**
 * Component that injects SVG icons directly into the DOM when on web platform
 * for testing and validation purposes
 */
export const ForceSVGIcons: React.FC = () => {
  // Only run on web platform
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    console.log('[ForceSVGIcons] Injecting test SVG icons into DOM');
    
    // Create a container for our test SVGs
    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.id = 'test-svg-container';
      container.style.position = 'absolute';
      container.style.bottom = '0';
      container.style.left = '0';
      container.style.opacity = '0.2';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '1000';
      document.body.appendChild(container);
      
      // Insert a few key SVGs for testing
      const keySvgs = ['Home', 'Menu', 'LayoutGrid', 'File', 'FolderOpen'];
      
      keySvgs.forEach(iconName => {
        if (SVG_ICONS[iconName]) {
          const wrapper = document.createElement('div');
          wrapper.className = 'svg-icon-wrapper';
          wrapper.style.display = 'inline-block';
          wrapper.style.margin = '5px';
          wrapper.style.width = '24px';
          wrapper.style.height = '24px';
          
          // Create SVG element
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '24');
          svg.setAttribute('height', '24');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          svg.setAttribute('stroke-width', '2');
          svg.setAttribute('data-testid', `test-icon-${iconName}`);
          
          // Get path definition
          const pathD = SVG_ICONS[iconName];
          if (typeof pathD === 'string') {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathD);
            
            svg.appendChild(path);
            wrapper.appendChild(svg);
            container.appendChild(wrapper);
            
            console.log(`[ForceSVGIcons] Injected test icon: ${iconName}`);
          }
        }
      });
      
      // Clean up on unmount
      return () => {
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }
      };
    }
  }, []);
  
  // This component doesn't render anything visible
  return Platform.OS === 'web' ? <View style={styles.hidden} /> : null;
};

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
}); 