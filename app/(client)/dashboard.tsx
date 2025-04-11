import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Container, Text, Card, Button } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { getAllServices } from '../lib/db/repositories/serviceRepository';
import { Service } from '../lib/db/types';

const ClientDashboard = () => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Placeholder data for active services
  const activeServices = [
    {
      id: 1,
      title: 'Essay Writing - History of Art',
      dueDate: '2023-07-15',
      status: 'in-progress',
      progress: 60,
      expert: 'Dr. Sarah Johnson',
    },
    {
      id: 2,
      title: 'Research Paper - Climate Change',
      dueDate: '2023-07-22',
      status: 'assigned',
      progress: 25,
      expert: 'Prof. Michael Lee',
    },
  ];

  // Placeholder data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'file',
      content: 'Your document was reviewed by the expert',
      time: '2 hours ago',
      icon: 'FileText',
      color: Colors.primary,
    },
    {
      id: 2,
      type: 'status',
      content: 'Your "Research Paper" has been assigned',
      time: '5 hours ago',
      icon: 'User',
      color: Colors.success,
    },
    {
      id: 3,
      type: 'file',
      content: 'You uploaded a new reference document',
      time: '1 day ago',
      icon: 'Upload',
      color: Colors.secondary,
    },
    {
      id: 4,
      type: 'payment',
      content: 'Payment confirmed for Essay Writing service',
      time: '2 days ago',
      icon: 'CreditCard',
      color: Colors.warning,
    },
  ];

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

  // Render a status badge based on the service status
  const renderStatusBadge = (status: string) => {
    let badgeColor;
    let statusText;

    switch (status) {
      case 'in-progress':
        badgeColor = Colors.warning;
        statusText = 'In Progress';
        break;
      case 'assigned':
        badgeColor = Colors.primary;
        statusText = 'Assigned';
        break;
      case 'completed':
        badgeColor = Colors.success;
        statusText = 'Completed';
        break;
      case 'review':
        badgeColor = Colors.secondary;
        statusText = 'In Review';
        break;
      default:
        badgeColor = Colors.muted;
        statusText = 'Pending';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };

  // Render a progress bar for service completion
  const renderProgressBar = (progress: number) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  return (
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

        {/* Active Services Section */}
        <View style={styles.servicesContainer}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
              Active Services
            </Text>
            <TouchableOpacity onPress={() => router.push('/(client)/services')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {activeServices.length > 0 ? (
            activeServices.map(service => (
              <Card key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text variant="h5" weight="semiBold" style={styles.serviceTitle}>
                    {service.title}
                  </Text>
                  {renderStatusBadge(service.status)}
                </View>
                
                <View style={styles.serviceDetails}>
                  <View style={styles.serviceDetail}>
                    <SafeIcon name="Calendar" size={16} color={Colors.muted} />
                    <Text style={styles.serviceDetailText}>Due: {service.dueDate}</Text>
                  </View>
                  <View style={styles.serviceDetail}>
                    <SafeIcon name="User" size={16} color={Colors.muted} />
                    <Text style={styles.serviceDetailText}>Expert: {service.expert}</Text>
                  </View>
                </View>
                
                <View style={styles.serviceProgressContainer}>
                  <Text style={styles.serviceProgressText}>Progress: {service.progress}%</Text>
                  {renderProgressBar(service.progress)}
                </View>
                
                <View style={styles.serviceActions}>
                  <Button 
                    title="View Details" 
                    variant="outline"
                    size="small"
                    onPress={() => router.push({
                      pathname: '/(client)/service-detail',
                      params: { id: service.id }
                    })}
                    style={styles.serviceButton}
                  />
                  <Button
                    title="Upload Materials"
                    variant="outline"
                    size="small"
                    onPress={navigateToUpload}
                    style={styles.serviceButton}
                  />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <SafeIcon name="File" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No active services</Text>
              <Text style={styles.emptySubtext}>
                Get started by requesting a new academic service
              </Text>
              <Button 
                title="Request Service" 
                onPress={navigateToNewRequest}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.activityContainer}>
          <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          
          {recentActivity.length > 0 ? (
            <Card style={styles.activityCard}>
              {recentActivity.map((activity, index) => (
                <View key={activity.id}>
                  <View style={styles.activityItem}>
                    <View 
                      style={[
                        styles.activityIconContainer, 
                        { backgroundColor: activity.color }
                      ]}
                    >
                      <SafeIcon name={activity.icon} size={16} color={Colors.white} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>{activity.content}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                  {index < recentActivity.length - 1 && <View style={styles.activityDivider} />}
                </View>
              ))}
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <SafeIcon name="Activity" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>
                Your activity history will appear here
              </Text>
            </Card>
          )}
        </View>
      </Container>
    </ScrollView>
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
  serviceCard: {
    marginBottom: Spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceTitle: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Layout.borderRadius.small,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  serviceDetails: {
    marginBottom: Spacing.sm,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  serviceDetailText: {
    marginLeft: Spacing.xs,
    color: Colors.muted,
    fontSize: 14,
  },
  serviceProgressContainer: {
    marginBottom: Spacing.md,
  },
  serviceProgressText: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  serviceButton: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
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
  activityContainer: {
    marginBottom: Spacing.xxl,
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    marginBottom: Spacing.xs / 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.muted,
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
});

export default ClientDashboard; 