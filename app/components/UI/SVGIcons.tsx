import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// SVG path definitions for common icons
// These will be used for direct SVG rendering when Lucide fails to load
export const SVG_ICONS: Record<string, string> = {
  // Navigation Icons
  Home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  LayoutGrid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  Grid: "M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18",
  Menu: "M4 12h16 M4 6h16 M4 18h16",
  X: "M18 6 6 18 M6 6l12 12",

  // File Icons
  File: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6",
  FileText: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  ImageIcon: "M3 3h18v18H3z M9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
  Trash: "M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",

  // Business Icons
  Briefcase: "M2 7h20v14H2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  
  // Video and Audio
  Video: "m22 8-6 4 6 4V8z M2 6h14v12H2z",
  Music: "M9 18V5l12-2v13 M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M18 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  Archive: "M2 3h20v5H2z M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8 M10 12h4",
  
  // Additional Icons
  FolderOpen: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M2 10h20v9H2z",
  ChevronLeft: "m15 18-6-6 6-6",
  ChevronRight: "m9 18 6-6-6-6",
  ChevronDown: "m6 9 6 6 6-6",
  Search: "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l4.5 4.5",
  LogOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  User: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

interface SVGIconProps {
  name: string; 
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Component to render SVG icons directly
export const SVGIcon: React.FC<SVGIconProps> = ({ 
  name, 
  size = 24, 
  color = 'currentColor',
  strokeWidth = 2
}) => {
  // Get the SVG path for this icon
  const pathData = SVG_ICONS[name];
  
  if (!pathData) {
    console.warn(`[SVGIcon] Icon "${name}" not found in SVG definitions`);
    return null;
  }
  
  // Log rendering
  if (Platform.OS === 'web') {
    console.log(`[SVGIcon] Rendering SVG icon: ${name}`);
  }
  
  // For web platform, render an actual SVG
  if (Platform.OS === 'web') {
    // Create an SVG element with the path data
    const svgStyle = {
      width: `${size}px`,
      height: `${size}px`,
      display: 'inline-block',
      verticalAlign: 'middle',
      overflow: 'visible',
    };
    
    // Generate unique ID to help with debugging
    const uniqueId = `svg-icon-${name}-${Math.floor(Math.random() * 1000)}`;
    
    // Split the path data into separate commands
    const paths = pathData.split(' M').map((p, i) => 
      i === 0 ? p : `M${p}`
    );
    
    return (
      <div style={svgStyle} className="svg-icon-container" data-icon-name={name}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
          strokeLinejoin="round"
          id={uniqueId}
          data-lucide={name}
          style={{ display: 'block', color: color }}
        >
          {paths.map((d, i) => (
            <path key={`${name}-path-${i}`} d={d} />
          ))}
        </svg>
      </div>
    );
  }
  
  // For other platforms, return null as we're not supporting direct SVG rendering
  // This component should not be used on native platforms
  return null;
};

// Helper to check if SVG rendering is working
export const debugSVGIcons = () => {
  if (Platform.OS !== 'web') return false;
  
  console.log('[SVGIcons] Available icons:', Object.keys(SVG_ICONS));
  
  // Test rendering an SVG directly into the DOM
  if (typeof document !== 'undefined') {
    const testContainer = document.createElement('div');
    testContainer.id = 'svg-test-container';
    testContainer.style.position = 'absolute';
    testContainer.style.bottom = '10px';
    testContainer.style.right = '10px';
    testContainer.style.zIndex = '9999';
    testContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    testContainer.style.padding = '5px';
    testContainer.style.borderRadius = '3px';
    
    // Create a test SVG
    const testSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    testSvg.setAttribute('width', '24');
    testSvg.setAttribute('height', '24');
    testSvg.setAttribute('viewBox', '0 0 24 24');
    testSvg.setAttribute('fill', 'none');
    testSvg.setAttribute('stroke', 'currentColor');
    testSvg.setAttribute('stroke-width', '2');
    
    // Add a simple path (a circle)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z');
    
    testSvg.appendChild(path);
    testContainer.appendChild(testSvg);
    document.body.appendChild(testContainer);
    
    // Add a remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.style.marginLeft = '5px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.onclick = () => document.body.removeChild(testContainer);
    testContainer.appendChild(removeBtn);
    
    console.log('[SVGIcons] Test SVG injected into DOM');
    return true;
  }
  
  return false;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 