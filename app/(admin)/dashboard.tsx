import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Container, Card, TopNav } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing, Layout } from '../constants';
import { useAuth } from '../lib/firebase/hooks';
import { useRouter } from 'expo-router';

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  const AdminCard = ({ title, description, icon, onPress }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <Card style={styles.card}>
          <View style={styles.cardIconContainer}>
            <SafeIcon name={icon as any} size={24} color={Colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text variant="h3" weight="bold" style={styles.cardTitle}>
              {title}
            </Text>
            <Text style={styles.cardDescription}>
              {description}
            </Text>
          </View>
          <SafeIcon name="ChevronRight" size={20} color={Colors.muted} />
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TopNav />
      <Container>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="h1" weight="bold" style={styles.title}>
              Admin Dashboard
            </Text>
            <Text style={styles.subtitle}>
              Manage the Academic Lessons platform
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="h2" weight="bold" style={styles.sectionTitle}>
              Administration
            </Text>

            <AdminCard
              title="User Management"
              description="Manage users, roles, and permissions"
              icon="User"
              onPress={() => {
                router.push('/(admin)/users');
              }}
            />

            <AdminCard
              title="Service Management"
              description="Add, edit, or remove services"
              icon="Briefcase"
              onPress={() => {
                router.push('/(admin)/services');
              }}
            />

            <AdminCard
              title="Expert Verification"
              description="Review and verify expert applications"
              icon="Check"
              onPress={() => {
                router.push('/(admin)/expert-verification');
              }}
            />

            <AdminCard
              title="Request Monitoring"
              description="Monitor and manage service requests"
              icon="Search"
              onPress={() => {
                router.push('/(admin)/requests');
              }}
            />

            <AdminCard
              title="System Settings"
              description="Configure system settings and parameters"
              icon="Settings"
              onPress={() => {
                // Navigate to system settings screen
                // router.push('/(admin)/settings');
                alert('System settings will be available soon');
              }}
            />
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15', // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 2,
  },
  cardDescription: {
    color: Colors.muted,
    fontSize: 14,
  },
});

export default AdminDashboard; 