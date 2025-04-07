import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for services
const MOCK_SERVICES = [
  {
    id: '1',
    title: 'Research Paper on Climate Change',
    type: 'Research Paper',
    academicLevel: 'Undergraduate',
    deadline: '2023-12-15',
    budget: 250,
    status: 'In Progress',
    progress: 45,
    expertName: 'Dr. Sarah Johnson',
    createdAt: '2023-11-01',
  },
  {
    id: '2',
    title: 'Linear Algebra Assignment',
    type: 'Assignment',
    academicLevel: 'Undergraduate',
    deadline: '2023-11-30',
    budget: 150,
    status: 'In Review',
    progress: 90,
    expertName: 'Prof. Michael Chen',
    createdAt: '2023-11-05',
  },
  {
    id: '3',
    title: 'Marketing Strategy Presentation',
    type: 'Presentation',
    academicLevel: 'Masters',
    deadline: '2023-12-10',
    budget: 300,
    status: 'Completed',
    progress: 100,
    expertName: 'Dr. Emily Rodriguez',
    createdAt: '2023-10-15',
  },
  {
    id: '4',
    title: 'Python Programming Project',
    type: 'Project',
    academicLevel: 'Undergraduate',
    deadline: '2023-12-20',
    budget: 200,
    status: 'Not Started',
    progress: 0,
    expertName: 'Pending Assignment',
    createdAt: '2023-11-10',
  },
  {
    id: '5',
    title: 'Literature Review on Modern Poetry',
    type: 'Literature Review',
    academicLevel: 'PhD',
    deadline: '2023-12-30',
    budget: 450,
    status: 'In Progress',
    progress: 35,
    expertName: 'Dr. Robert Williams',
    createdAt: '2023-10-25',
  },
  {
    id: '6',
    title: 'Economics Case Study Analysis',
    type: 'Case Study',
    academicLevel: 'Masters',
    deadline: '2023-11-28',
    budget: 275,
    status: 'Cancelled',
    progress: 20,
    expertName: 'Dr. Julia Martinez',
    createdAt: '2023-10-30',
  },
  {
    id: '7',
    title: 'Biochemistry Lab Report',
    type: 'Lab Report',
    academicLevel: 'Undergraduate',
    deadline: '2023-12-05',
    budget: 180,
    status: 'In Progress',
    progress: 60,
    expertName: 'Prof. David Thompson',
    createdAt: '2023-11-02',
  },
];

// Type definition for service
type Service = {
  id: string;
  title: string;
  type: string;
  academicLevel: string;
  deadline: string;
  budget: number;
  status: string;
  progress: number;
  expertName: string;
  createdAt: string;
};

// Filter options
type FilterOptions = {
  search: string;
  status: string;
  sortBy: 'deadline' | 'budget' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};

const ServicesList = () => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [filteredServices, setFilteredServices] = useState<Service[]>(MOCK_SERVICES);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'All',
    sortBy: 'deadline',
    sortOrder: 'asc',
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Statuses for filter
  const statuses = ['All', 'Not Started', 'In Progress', 'In Review', 'Completed', 'Cancelled'];

  useEffect(() => {
    applyFilters();
  }, [filters, services]);

  const applyFilters = () => {
    let result = [...services];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(service => 
        service.title.toLowerCase().includes(searchLower) ||
        service.type.toLowerCase().includes(searchLower) ||
        service.expertName.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'All') {
      result = result.filter(service => service.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredServices(result);
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Not Started':
        return styles.statusNotStarted;
      case 'In Progress':
        return styles.statusInProgress;
      case 'In Review':
        return styles.statusInReview;
      case 'Completed':
        return styles.statusCompleted;
      case 'Cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusNotStarted;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'Not Started':
        return styles.statusTextNotStarted;
      case 'In Progress':
        return styles.statusTextInProgress;
      case 'In Review':
        return styles.statusTextInReview;
      case 'Completed':
        return styles.statusTextCompleted;
      case 'Cancelled':
        return styles.statusTextCancelled;
      default:
        return styles.statusTextNotStarted;
    }
  };

  const renderServiceCard = ({ item }: { item: Service }) => {
    // Format deadline date
    const deadlineDate = new Date(item.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Calculate days remaining
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return (
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => router.push('/(client)/service-detail')}
      >
        <View style={styles.cardHeader}>
          <Text variant="h5" weight="semiBold" style={styles.serviceTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.serviceInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{item.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Expert:</Text>
            <Text style={styles.infoValue}>{item.expertName}</Text>
          </View>
        </View>

        <View style={styles.serviceInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Level:</Text>
            <Text style={styles.infoValue}>{item.academicLevel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Budget:</Text>
            <Text style={styles.infoValue}>${item.budget}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress:</Text>
            <Text style={styles.progressPercentage}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${item.progress}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.deadlineSection}>
          <View style={styles.deadlineInfo}>
            <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
            <Text style={styles.deadlineText}>
              {formattedDeadline}
            </Text>
          </View>
          <Text style={[
            styles.daysRemaining,
            diffDays < 3 ? styles.urgentDeadline : 
            diffDays < 7 ? styles.approachingDeadline : {}
          ]}>
            {diffDays > 0 
              ? `${diffDays} day${diffDays !== 1 ? 's' : ''} left` 
              : item.status === 'Completed' 
                ? 'Completed' 
                : 'Overdue'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[0]}>
        <View style={styles.stickyHeader}>
          <Container>
            <View style={styles.header}>
              <Text variant="h2" weight="bold" style={styles.title}>
                My Services
              </Text>
              <Button
                variant="primary"
                title="Request Service"
                onPress={() => router.push('/(client)/request-service')}
                size="small"
                style={styles.requestButton}
              />
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search services..."
                  value={filters.search}
                  onChangeText={(text) => updateFilter('search', text)}
                />
                {filters.search ? (
                  <TouchableOpacity onPress={() => updateFilter('search', '')}>
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Ionicons 
                  name={isFilterVisible ? "options" : "options-outline"} 
                  size={22} 
                  color={isFilterVisible ? Colors.primary : Colors.dark} 
                />
              </TouchableOpacity>
            </View>

            {isFilterVisible && (
              <View style={styles.filtersContainer}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Status:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
                    {statuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusFilterItem,
                          filters.status === status ? styles.statusFilterActive : {}
                        ]}
                        onPress={() => updateFilter('status', status)}
                      >
                        <Text 
                          style={[
                            styles.statusFilterText,
                            filters.status === status ? styles.statusFilterTextActive : {}
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Sort by:</Text>
                  <View style={styles.sortOptions}>
                    <TouchableOpacity
                      style={[
                        styles.sortOption,
                        filters.sortBy === 'deadline' ? styles.sortOptionActive : {}
                      ]}
                      onPress={() => updateFilter('sortBy', 'deadline')}
                    >
                      <Text 
                        style={[
                          styles.sortOptionText,
                          filters.sortBy === 'deadline' ? styles.sortOptionTextActive : {}
                        ]}
                      >
                        Deadline
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.sortOption,
                        filters.sortBy === 'budget' ? styles.sortOptionActive : {}
                      ]}
                      onPress={() => updateFilter('sortBy', 'budget')}
                    >
                      <Text 
                        style={[
                          styles.sortOptionText,
                          filters.sortBy === 'budget' ? styles.sortOptionTextActive : {}
                        ]}
                      >
                        Budget
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.sortOption,
                        filters.sortBy === 'createdAt' ? styles.sortOptionActive : {}
                      ]}
                      onPress={() => updateFilter('sortBy', 'createdAt')}
                    >
                      <Text 
                        style={[
                          styles.sortOptionText,
                          filters.sortBy === 'createdAt' ? styles.sortOptionTextActive : {}
                        ]}
                      >
                        Created
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.sortOrderButton}
                      onPress={toggleSortOrder}
                    >
                      <Ionicons 
                        name={filters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                        size={18} 
                        color={Colors.dark}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </Container>
        </View>

        <Container style={styles.servicesContainer}>
          <Text style={styles.resultsText}>
            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
          </Text>

          {filteredServices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color={Colors.muted} />
              <Text style={styles.emptyStateTitle}>No services found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your filters or request a new service
              </Text>
              <Button
                title="Request a Service"
                onPress={() => router.push('/(client)/request-service')}
                style={styles.emptyStateButton}
              />
            </View>
          ) : (
            <FlatList
              data={filteredServices}
              renderItem={renderServiceCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.servicesList}
            />
          )}
        </Container>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: Colors.light,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
  },
  requestButton: {
    minWidth: 140,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Spacing.sm,
    height: 45,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  filterButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#f9f9f9',
    borderRadius: Layout.borderRadius.medium,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: Colors.dark,
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilterItem: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.small,
    backgroundColor: '#eee',
    marginRight: Spacing.xs,
  },
  statusFilterActive: {
    backgroundColor: Colors.primary,
  },
  statusFilterText: {
    fontSize: 14,
    color: Colors.dark,
  },
  statusFilterTextActive: {
    color: Colors.white,
  },
  sortOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.small,
    backgroundColor: '#eee',
    marginRight: Spacing.xs,
  },
  sortOptionActive: {
    backgroundColor: Colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.dark,
  },
  sortOptionTextActive: {
    color: Colors.white,
  },
  sortOrderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  servicesList: {
    gap: Spacing.md,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.medium,
    padding: Spacing.md,
    ...Layout.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceTitle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.pill,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusNotStarted: {
    backgroundColor: '#f0f0f0',
  },
  statusTextNotStarted: {
    color: '#666',
  },
  statusInProgress: {
    backgroundColor: '#e1f5fe',
  },
  statusTextInProgress: {
    color: '#0277bd',
  },
  statusInReview: {
    backgroundColor: '#fff8e1',
  },
  statusTextInReview: {
    color: '#ff8f00',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusTextCompleted: {
    color: '#2e7d32',
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
  },
  statusTextCancelled: {
    color: '#c62828',
  },
  serviceInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.muted,
    marginRight: Spacing.xs / 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs / 2,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.muted,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
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
  deadlineSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: Spacing.xs,
    fontSize: 14,
    color: Colors.dark,
  },
  daysRemaining: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  urgentDeadline: {
    color: Colors.danger,
  },
  approachingDeadline: {
    color: Colors.warning,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    color: Colors.dark,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});

export default ServicesList; 