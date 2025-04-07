import React, { useEffect } from 'react';
import { ScrollView, View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from '@/app/components/UI/Text';
import SafeIcon from '@/app/components/UI/SafeIcon';
import { SVG_ICONS } from '@/app/components/UI/SVGIcons';
import { TopNav } from '@/app/components/UI/TopNav';

// Add TypeScript declarations for window properties
declare global {
  interface Window {
    runIconTest?: () => string;
  }
}

/**
 * This is a test page to validate and debug icon rendering
 * It provides tools to test different icon rendering approaches
 */
export default function IconTestPage() {
  // Log debug information on mount
  useEffect(() => {
    console.log('[ICON_TEST] Page mounted on platform:', Platform.OS);
    console.log('[ICON_TEST] Available SVG icons:', Object.keys(SVG_ICONS).length);
    
    // Run debug on web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('[ICON_TEST] Running on web, setting up debug tools');
      
      // Register a global helper
      window.runIconTest = () => {
        console.log('[ICON_TEST] Manual test triggered');
        if (window.debugSvgIconSystem) {
          window.debugSvgIconSystem();
        }
        return 'Icon test initiated';
      };
    }
  }, []);
  
  // Trigger manual icon debug
  const handleDebugClick = () => {
    console.log('[ICON_TEST] Debug button clicked');
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.debugSvgIconSystem) {
        window.debugSvgIconSystem();
      }
    }
  };
  
  // Open console logs
  const handleConsoleClick = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('[ICON_TEST] Opening console logs');
      console.log('[ICON_TEST] Available debug commands:');
      console.log('- window.debugSvgIconSystem()'); 
      console.log('- window.debugIcons()');
      console.log('- window.iconDebugLog');
    }
  };
  
  // Manually create an SVG
  const handleCreateSvgClick = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      console.log('[ICON_TEST] Creating test SVG in DOM');
      
      // Create container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '100px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.backgroundColor = 'white';
      container.style.padding = '10px';
      container.style.borderRadius = '5px';
      container.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      
      // Add heading
      const heading = document.createElement('h3');
      heading.textContent = 'Test SVG';
      container.appendChild(heading);
      
      // Create SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '50');
      svg.setAttribute('height', '50');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      
      // Add path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z');
      svg.appendChild(path);
      
      // Add SVG to container
      container.appendChild(svg);
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.style.marginTop = '10px';
      closeBtn.onclick = () => document.body.removeChild(container);
      container.appendChild(closeBtn);
      
      // Add to body
      document.body.appendChild(container);
    }
  };
  
  // Get all available icons
  const iconNames = Object.keys(SVG_ICONS);
  
  return (
    <View style={styles.container}>
      <TopNav title="Icon Debug Page" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="h1" weight="bold" style={styles.title}>Icon Test Page</Text>
          <Text>Test and debug icon rendering issues</Text>
        </View>
        
        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={handleDebugClick}>
            <Text style={styles.buttonText}>Run Icon Debug</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={handleConsoleClick}>
            <Text style={styles.buttonText}>View Console Helpers</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={handleCreateSvgClick}>
            <Text style={styles.buttonText}>Create Test SVG</Text>
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text variant="h2" weight="bold" style={styles.sectionTitle}>Available Icons ({iconNames.length})</Text>
          <Text style={styles.description}>Using SafeIcon with direct SVG rendering:</Text>
          
          <View style={styles.iconGrid}>
            {iconNames.map(iconName => (
              <View key={iconName} style={styles.iconItem}>
                <SafeIcon name={iconName as any} size={32} color="#333" />
                <Text style={styles.iconLabel}>{iconName}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text>Platform: {Platform.OS}</Text>
          <Text>Debug tools available: {Platform.OS === 'web' ? 'Yes' : 'No'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  description: {
    marginBottom: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconItem: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
}); 