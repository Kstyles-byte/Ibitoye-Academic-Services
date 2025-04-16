import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Container, Text, Card, Button, TopNav } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { getAllServices } from '../lib/db/repositories/serviceRepository';
import { Service } from '../lib/db/types';
import { signOut } from '../lib/firebase/auth';
import { useAuth } from '../lib/firebase/hooks';

const ClientDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Fetch available services from backend
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      // Fetch only active services
      const fetchedServices = await getAllServices(true);
      setServices(fetchedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Navigate to request new service with preselected service
  const navigateToNewRequestWithService = (serviceId: string) => {
    router.push({
      pathname: '/(client)/request-service',
      params: { serviceId }
    } as any);
  };

  // Open WhatsApp support link
  const openSupportChat = () => {
    Linking.openURL('https://wa.link/b34wdr');
  };

  // Navigate to request new service
  const navigateToNewRequest = () => {
    router.push('/(client)/request-service');
  };

  // Navigate to file upload
  const navigateToUpload = () => {
    router.push('/(client)/upload' as any);
  };

  return (
    <>
      <TopNav rightComponent={
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <SafeIcon name="LogOut" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      } />
      <ScrollView style={styles.scrollView}>
        <Container>
          <View style={styles.header}>
            <Text variant="h2" weight="bold" style={styles.title}>
              Client Dashboard
            </Text>
            <Text style={styles.subtitle}>
              Welcome back! Here's an overview of your services
            </Text>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.quickActionsContainer}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={navigateToNewRequest}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary }]}>
                  <SafeIcon name="Plus" size={24} color={Colors.white} />
                </View>
                <Text style={styles.quickActionText}>New Request</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={navigateToUpload}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.warning }]}>
                  <SafeIcon name="Upload" size={24} color={Colors.white} />
                </View>
                <Text style={styles.quickActionText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={openSupportChat}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.secondary }]}>
                  <SafeIcon name="HelpCircle" size={24} color={Colors.white} />
                </View>
                <Text style={styles.quickActionText}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Services Section */}
          <View style={styles.servicesContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Available Services
              </Text>
            </View>
            
            {loadingServices ? (
              <Card style={styles.loadingCard}>
                <SafeIcon name="Loader" size={24} color={Colors.muted} />
                <Text style={styles.loadingText}>Loading services...</Text>
              </Card>
            ) : services.length > 0 ? (
              services.map(service => (
                <Card key={service.id} style={styles.availableServiceCard}>
                  <View style={styles.availableServiceHeader}>
                    <Text variant="h5" weight="semiBold" style={styles.availableServiceTitle}>
                      {service.name}
                    </Text>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>₦{service.basePrice.toLocaleString()}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.availableServiceDescription}>
                    {service.description}
                  </Text>
                  
                  <Text style={styles.categoryText}>
                    <Text style={styles.categoryLabel}>Category: </Text>
                    {service.category}
                  </Text>
                  
                  <Button
                    title="Request This Service"
                    variant="outline"
                    size="small"
                    onPress={() => navigateToNewRequestWithService(service.id)}
                    style={styles.requestServiceButton}
                  />
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <SafeIcon name="Package" size={48} color={Colors.muted} />
                <Text style={styles.emptyText}>No services available</Text>
                <Text style={styles.emptySubtext}>
                  Check back later for new services
                </Text>
              </Card>
            )}
          </View>
        </Container>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
  },
  quickActionsContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickAction: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  servicesContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllLink: {
    color: Colors.primary,
  },
  availableServiceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  availableServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  availableServiceTitle: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  priceBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Layout.borderRadius.small,
  },
  priceText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 14,
  },
  availableServiceDescription: {
    marginBottom: Spacing.sm,
    color: Colors.muted,
  },
  categoryText: {
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  categoryLabel: {
    fontWeight: '500',
  },
  requestServiceButton: {
    alignSelf: 'flex-start',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    color: Colors.muted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  emptyButton: {
    marginTop: Spacing.md,
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.muted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  logoutText: {
    color: Colors.danger,
    marginLeft: 4,
    fontSize: 14,
  },
});

export default ClientDashboard; 