import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform, Modal } from 'react-native';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/firebase/hooks';
import { Role } from '../../lib/db/types';

interface TopNavProps {
  title?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ title }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Set responsive breakpoint (768px is typical tablet breakpoint)
  const isSmallScreen = screenWidth < 768;

  useEffect(() => {
    // Listen for dimension changes
    const dimensionsHandler = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => {
      // Clean up event listener
      dimensionsHandler.remove();
    };
  }, []);

  const navigateToDashboard = () => {
    if (!user) {
      router.push('/');
      return;
    }

    // Convert role to uppercase for case-insensitive comparison
    const roleUpper = String(user.role).toUpperCase();

    switch (roleUpper) {
      case Role.ADMIN:
      case 'ADMIN':
        router.push('/(admin)/dashboard');
        break;
      case Role.CLIENT:
      case 'CLIENT':
        router.push('/(client)/dashboard');
        break;
      case Role.EXPERT:
      case 'EXPERT':
        router.push('/(expert)/dashboard');
        break;
      default:
        router.push('/');
    }
    setMenuOpen(false);
  };

  const navigateToHome = () => {
    router.push('/');
    setMenuOpen(false);
  };
  
  const navigateToServices = () => {
    router.push('/services');
    setMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <TouchableOpacity style={styles.navLink} onPress={navigateToDashboard}>
        <Ionicons name="grid-outline" size={18} color={Colors.dark} />
        <Text style={styles.navLinkText}>Dashboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navLink} onPress={navigateToHome}>
        <Ionicons name="home-outline" size={18} color={Colors.dark} />
        <Text style={styles.navLinkText}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navLink} onPress={navigateToServices}>
        <Ionicons name="briefcase-outline" size={18} color={Colors.dark} />
        <Text style={styles.navLinkText}>Services</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.logo} onPress={() => router.push('/')}>
          <Text weight="bold" style={styles.logoText}>Academic Lessons</Text>
        </TouchableOpacity>
        
        {isSmallScreen ? (
          // Hamburger menu for small screens
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setMenuOpen(true)}
          >
            <Ionicons name="menu-outline" size={24} color={Colors.dark} />
          </TouchableOpacity>
        ) : (
          // Regular horizontal nav for larger screens
          <View style={styles.navLinks}>
            <NavLinks />
          </View>
        )}
      </View>
      
      {title && (
        <View style={styles.titleContainer}>
          <Text variant="h2" weight="bold" style={styles.title}>{title}</Text>
        </View>
      )}

      {/* Mobile Menu Modal */}
      {isSmallScreen && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={menuOpen}
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text weight="bold" style={styles.modalTitle}>Menu</Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setMenuOpen(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.dark} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.mobileNavLinks}>
                <NavLinks />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    color: Colors.primary,
  },
  menuButton: {
    padding: 8,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 20,
  },
  navLinkText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.dark,
  },
  titleContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.md, // Extra padding for iOS devices with home indicator
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.dark,
  },
  closeButton: {
    padding: 4,
  },
  mobileNavLinks: {
    paddingVertical: Spacing.sm,
  },
}); 