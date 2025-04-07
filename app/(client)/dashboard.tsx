import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Container, Text, Card, Button } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ClientDashboard = () => {
  const router = useRouter();
  
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
      type: 'message',
      content: 'Expert left a message on "Essay Writing"',
      time: '2 hours ago',
      icon: 'chatbubble',
      color: Colors.primary,
    },
    {
      id: 2,
      type: 'status',
      content: 'Your "Research Paper" has been assigned',
      time: '5 hours ago',
      icon: 'person-add',
      color: Colors.success,
    },
    {
      id: 3,
      type: 'file',
      content: 'You uploaded a new reference document',
      time: '1 day ago',
      icon: 'document',
      color: Colors.secondary,
    },
  ];

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
              onPress={() => router.push('/(client)/request-service')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary }]}>
                <Ionicons name="add" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>New Request</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(client)/messages')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.success }]}>
                <Ionicons name="chatbubbles" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(client)/upload')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.warning }]}>
                <Ionicons name="cloud-upload" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(client)/support')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="help-buoy" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
          </View>
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
                    <Ionicons name="calendar" size={16} color={Colors.muted} />
                    <Text style={styles.serviceDetailText}>Due: {service.dueDate}</Text>
                  </View>
                  <View style={styles.serviceDetail}>
                    <Ionicons name="person" size={16} color={Colors.muted} />
                    <Text style={styles.serviceDetailText}>Expert: {service.expert}</Text>
                  </View>
                </View>
                
                <View style={styles.serviceProgressContainer}>
                  <Text style={styles.serviceProgressText}>Progress: {service.progress}%</Text>
                  {renderProgressBar(service.progress)}
                </View>
                
                <Button 
                  title="View Details" 
                  variant="outline"
                  size="small"
                  onPress={() => router.push('/(client)/service-detail')}
                  style={styles.serviceButton}
                />
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="document" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No active services</Text>
              <Text style={styles.emptySubtext}>
                Get started by requesting a new academic service
              </Text>
              <Button 
                title="Request Service" 
                onPress={() => router.push('/(client)/request-service')}
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
                      <Ionicons name={activity.icon as any} size={16} color={Colors.white} />
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
              <Ionicons name="notifications" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>
                Your recent activities will appear here
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
    width: '23%',
    alignItems: 'center',
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
  serviceButton: {
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