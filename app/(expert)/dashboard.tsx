import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Container, Text, Card, Button } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../lib/firebase/auth';

const ExpertDashboard = () => {
  const router = useRouter();
  
  // Placeholder data for assigned projects
  const assignedProjects = [
    {
      id: 1,
      title: 'Essay Writing - History of Art',
      client: 'Sarah K.',
      dueDate: '2023-07-15',
      status: 'in-progress',
      progress: 60,
    },
    {
      id: 2,
      title: 'Research Paper - Climate Change',
      client: 'Michael T.',
      dueDate: '2023-07-22',
      status: 'assigned',
      progress: 25,
    },
  ];

  // Placeholder data for pending requests
  const pendingRequests = [
    {
      id: 1,
      title: 'Math Problem Sets - Calculus',
      client: 'James W.',
      budget: '₦8,000',
      deadline: '2023-08-05',
    },
    {
      id: 2,
      title: 'Literature Review - Modern Poetry',
      client: 'Emily L.',
      budget: '₦12,000',
      deadline: '2023-08-10',
    },
  ];

  // Placeholder data for expert stats
  const expertStats = {
    completedProjects: 24,
    activeProjects: 2,
    rating: 4.8,
    earnings: '₦458,000',
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

  // Render a progress bar for project completion
  const renderProgressBar = (progress: number) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut();
              // The auth state change will trigger navigation to login
            } catch (error) {
              Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Container>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="h2" weight="bold" style={styles.title}>
              Expert Dashboard
            </Text>
            <Text style={styles.subtitle}>
              Welcome back! Here's an overview of your projects
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Expert Stats Section */}
        <Card style={styles.statsCard}>
          <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
            Your Performance
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{expertStats.completedProjects}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.warning }]}>
                <Ionicons name="time" size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{expertStats.activeProjects}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.primary }]}>
                <Ionicons name="star" size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{expertStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="cash" size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{expertStats.earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsContainer}>
          <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(expert)/available-projects')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary }]}>
                <Ionicons name="search" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Find Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(expert)/messages')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.success }]}>
                <Ionicons name="chatbubbles" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(expert)/schedule')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.warning }]}>
                <Ionicons name="calendar" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(expert)/earnings')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="wallet" size={24} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Projects Section */}
        <View style={styles.projectsContainer}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
              Active Projects
            </Text>
            <TouchableOpacity onPress={() => router.push('/(expert)/projects')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {assignedProjects.length > 0 ? (
            assignedProjects.map(project => (
              <Card key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text variant="h5" weight="semiBold" style={styles.projectTitle}>
                    {project.title}
                  </Text>
                  {renderStatusBadge(project.status)}
                </View>
                
                <View style={styles.projectDetails}>
                  <View style={styles.projectDetail}>
                    <Ionicons name="person" size={16} color={Colors.muted} />
                    <Text style={styles.projectDetailText}>Client: {project.client}</Text>
                  </View>
                  <View style={styles.projectDetail}>
                    <Ionicons name="calendar" size={16} color={Colors.muted} />
                    <Text style={styles.projectDetailText}>Due: {project.dueDate}</Text>
                  </View>
                </View>
                
                <View style={styles.projectProgressContainer}>
                  <Text style={styles.projectProgressText}>Progress: {project.progress}%</Text>
                  {renderProgressBar(project.progress)}
                </View>
                
                <Button 
                  title="View Details" 
                  variant="outline"
                  size="small"
                  onPress={() => router.push('/(expert)/project-detail')}
                  style={styles.projectButton}
                />
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="document" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No active projects</Text>
              <Text style={styles.emptySubtext}>
                Browse available projects to find work
              </Text>
              <Button 
                title="Find Projects" 
                onPress={() => router.push('/(expert)/available-projects')}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        {/* Pending Requests Section */}
        <View style={styles.requestsContainer}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
              Project Requests
            </Text>
            <TouchableOpacity onPress={() => router.push('/(expert)/available-projects')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {pendingRequests.length > 0 ? (
            pendingRequests.map(request => (
              <Card key={request.id} style={styles.requestCard}>
                <Text variant="h5" weight="semiBold" style={styles.requestTitle}>
                  {request.title}
                </Text>
                
                <View style={styles.requestDetails}>
                  <View style={styles.requestDetail}>
                    <Ionicons name="person" size={16} color={Colors.muted} />
                    <Text style={styles.requestDetailText}>Client: {request.client}</Text>
                  </View>
                  <View style={styles.requestDetail}>
                    <Ionicons name="calendar" size={16} color={Colors.muted} />
                    <Text style={styles.requestDetailText}>Deadline: {request.deadline}</Text>
                  </View>
                  <View style={styles.requestDetail}>
                    <Ionicons name="cash" size={16} color={Colors.muted} />
                    <Text style={styles.requestDetailText}>Budget: {request.budget}</Text>
                  </View>
                </View>
                
                <View style={styles.requestActions}>
                  <Button 
                    title="Accept" 
                    variant="success"
                    size="small"
                    onPress={() => {
                      // Handle accept project logic
                      Alert.alert('Success', 'Project accepted!');
                    }}
                    style={styles.requestActionButton}
                  />
                  <Button 
                    title="View Details" 
                    variant="outline"
                    size="small"
                    onPress={() => router.push('/(expert)/request-detail')}
                    style={styles.requestActionButton}
                  />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="document" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new project requests
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
  },
  statItem: {
    width: '23%',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
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
  projectsContainer: {
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
  projectCard: {
    marginBottom: Spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  projectTitle: {
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
  projectDetails: {
    marginBottom: Spacing.sm,
  },
  projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  projectDetailText: {
    marginLeft: Spacing.xs,
    color: Colors.muted,
    fontSize: 14,
  },
  projectProgressContainer: {
    marginBottom: Spacing.md,
  },
  projectProgressText: {
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
  projectButton: {
    alignSelf: 'flex-start',
  },
  requestsContainer: {
    marginBottom: Spacing.xxl,
  },
  requestCard: {
    marginBottom: Spacing.md,
  },
  requestTitle: {
    marginBottom: Spacing.sm,
  },
  requestDetails: {
    marginBottom: Spacing.md,
  },
  requestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  requestDetailText: {
    marginLeft: Spacing.xs,
    color: Colors.muted,
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  requestActionButton: {
    marginRight: Spacing.sm,
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
  logoutButton: {
    padding: Spacing.sm,
  },
});

export default ExpertDashboard; 