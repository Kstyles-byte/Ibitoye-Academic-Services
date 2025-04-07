import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Text, Container, Card, Button, TopNav } from '../components/UI';
import { Colors, Spacing } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getDocuments, updateDocument, getDocumentById } from '../lib/db/firestore';
import { Expert, User } from '../lib/db/types';

interface ExpertWithUser extends Expert {
  user?: User;
}

const ExpertVerification = () => {
  const router = useRouter();
  const [experts, setExperts] = useState<ExpertWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<ExpertWithUser | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const expertDocs = await getDocuments<Expert>('experts');
      
      // Fetch user data for each expert
      const expertsWithUserData: ExpertWithUser[] = await Promise.all(
        expertDocs.map(async (expert): Promise<ExpertWithUser> => {
          try {
            const userData = await getDocumentById<User>('users', expert.userId);
            return {
              ...expert,
              user: userData ?? undefined
            };
          } catch (error) {
            console.error(`Error fetching user data for expert ${expert.id}:`, error);
            return {
              ...expert
            };
          }
        })
      );
      
      setExperts(expertsWithUserData);
    } catch (error) {
      console.error('Error fetching experts:', error);
      Alert.alert('Error', 'Failed to fetch experts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyExpert = async (expertId: string, isVerified: boolean) => {
    try {
      await updateDocument<Expert>('experts', expertId, { isVerified });
      
      // Update local state
      setExperts(prevExperts => 
        prevExperts.map(expert => 
          expert.id === expertId ? { ...expert, isVerified } : expert
        )
      );
      
      setSelectedExpert(null);
      Alert.alert(
        'Success', 
        `Expert ${isVerified ? 'verified' : 'rejected'} successfully`
      );
    } catch (error) {
      console.error('Error updating expert verification status:', error);
      Alert.alert('Error', 'Failed to update expert status. Please try again.');
    }
  };

  const filteredExperts = experts.filter(expert => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !expert.isVerified;
    if (filter === 'verified') return expert.isVerified;
    return true;
  });

  const ExpertListItem = ({ expert }: { expert: ExpertWithUser }) => {
    return (
      <Card style={styles.expertCard}>
        <View style={styles.expertHeader}>
          <View style={styles.expertAvatarContainer}>
            {expert.user?.image ? (
              <Image 
                source={{ uri: expert.user.image }} 
                style={styles.expertAvatar} 
              />
            ) : (
              <View style={styles.expertAvatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {expert.user?.name ? expert.user.name.charAt(0).toUpperCase() : 'E'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.expertInfo}>
            <Text variant="h3" weight="bold">{expert.user?.name || 'Unknown Expert'}</Text>
            <Text style={styles.emailText}>{expert.user?.email || 'No email available'}</Text>
            
            <View style={styles.statusContainer}>
              <Text style={styles.label}>Status: </Text>
              <View style={{
                ...styles.statusBadge,
                ...(expert.isVerified ? styles.verifiedBadge : styles.pendingBadge)
              }}>
                <Text style={styles.statusText}>
                  {expert.isVerified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.specializationContainer}>
          <Text style={styles.sectionTitle}>Specialization</Text>
          <View style={styles.specializationTags}>
            {expert.specialization.map((speciality, index) => (
              <View key={index} style={styles.specializationTag}>
                <Text style={styles.specializationText}>{speciality}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {expert.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText} numberOfLines={3}>{expert.bio}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <Button
            title="View Details"
            onPress={() => setSelectedExpert(expert)}
            variant="secondary"
            style={styles.actionButton}
          />
          
          {!expert.isVerified ? (
            <Button
              title="Verify"
              onPress={() => handleVerifyExpert(expert.id, true)}
              style={styles.actionButton}
            />
          ) : (
            <Button
              title="Revoke"
              onPress={() => handleVerifyExpert(expert.id, false)}
              variant="danger"
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>
    );
  };

  const ExpertDetailModal = () => {
    if (!selectedExpert) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text variant="h2" weight="bold">Expert Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedExpert(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.expertProfileHeader}>
              <View style={styles.expertLargeAvatarContainer}>
                {selectedExpert.user?.image ? (
                  <Image 
                    source={{ uri: selectedExpert.user.image }} 
                    style={styles.expertLargeAvatar} 
                  />
                ) : (
                  <View style={styles.expertLargeAvatarPlaceholder}>
                    <Text style={styles.largeAvatarText}>
                      {selectedExpert.user?.name ? selectedExpert.user.name.charAt(0).toUpperCase() : 'E'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.expertDetailInfo}>
                <Text variant="h2" weight="bold">{selectedExpert.user?.name || 'Unknown Expert'}</Text>
                <Text style={styles.emailDetailText}>{selectedExpert.user?.email || 'No email available'}</Text>
                
                <View style={styles.statusDetailContainer}>
                  <Text style={styles.label}>Status: </Text>
                  <View style={{
                    ...styles.statusBadge,
                    ...(selectedExpert.isVerified ? styles.verifiedBadge : styles.pendingBadge)
                  }}>
                    <Text style={styles.statusText}>
                      {selectedExpert.isVerified ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Specialization</Text>
              <View style={styles.specializationTags}>
                {selectedExpert.specialization.map((speciality, index) => (
                  <View key={index} style={styles.specializationTag}>
                    <Text style={styles.specializationText}>{speciality}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {selectedExpert.education && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Education</Text>
                <Text style={styles.detailText}>{selectedExpert.education}</Text>
              </View>
            )}
            
            {selectedExpert.bio && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Bio</Text>
                <Text style={styles.detailText}>{selectedExpert.bio}</Text>
              </View>
            )}
            
            {selectedExpert.hourlyRate && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Hourly Rate</Text>
                <Text style={styles.detailText}>${selectedExpert.hourlyRate}/hour</Text>
              </View>
            )}
            
            <View style={styles.modalActions}>
              {!selectedExpert.isVerified ? (
                <Button
                  title="Verify Expert"
                  onPress={() => handleVerifyExpert(selectedExpert.id, true)}
                  style={{...styles.modalButton, marginRight: Spacing.sm}}
                />
              ) : (
                <Button
                  title="Revoke Verification"
                  onPress={() => handleVerifyExpert(selectedExpert.id, false)}
                  variant="danger"
                  style={{...styles.modalButton, marginRight: Spacing.sm}}
                />
              )}
              
              <Button
                title="Close"
                onPress={() => setSelectedExpert(null)}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </ScrollView>
        </Card>
      </View>
    );
  };

  return (
    <>
      <TopNav title="Expert Verification" />
      <Container>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={{
              ...styles.filterButton,
              ...(filter === 'all' ? styles.activeFilter : {})
            }}
            onPress={() => setFilter('all')}
          >
            <Text style={{
              ...styles.filterText,
              ...(filter === 'all' ? styles.activeFilterText : {})
            }}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              ...styles.filterButton,
              ...(filter === 'pending' ? styles.activeFilter : {})
            }}
            onPress={() => setFilter('pending')}
          >
            <Text style={{
              ...styles.filterText,
              ...(filter === 'pending' ? styles.activeFilterText : {})
            }}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              ...styles.filterButton,
              ...(filter === 'verified' ? styles.activeFilter : {})
            }}
            onPress={() => setFilter('verified')}
          >
            <Text style={{
              ...styles.filterText,
              ...(filter === 'verified' ? styles.activeFilterText : {})
            }}>Verified</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading experts...</Text>
          </View>
        ) : (
          <ScrollView style={styles.expertsList} showsVerticalScrollIndicator={false}>
            {filteredExperts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people" size={48} color={Colors.muted} />
                <Text style={styles.emptyStateText}>
                  {filter === 'pending' 
                    ? 'No pending experts to verify' 
                    : filter === 'verified' 
                      ? 'No verified experts' 
                      : 'No experts found'}
                </Text>
              </View>
            ) : (
              filteredExperts.map(expert => (
                <ExpertListItem key={expert.id} expert={expert} />
              ))
            )}
          </ScrollView>
        )}

        {selectedExpert && <ExpertDetailModal />}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Colors.background,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.dark,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.muted,
  },
  expertsList: {
    flex: 1,
  },
  expertCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  expertHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  expertAvatarContainer: {
    marginRight: Spacing.md,
  },
  expertAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  expertAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  expertInfo: {
    flex: 1,
  },
  emailText: {
    color: Colors.muted,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: Colors.dark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  verifiedBadge: {
    backgroundColor: Colors.success + '20',
  },
  pendingBadge: {
    backgroundColor: Colors.warning + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  specializationContainer: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.dark,
    fontWeight: '600',
    marginBottom: 4,
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  specializationText: {
    fontSize: 12,
    color: Colors.dark,
  },
  bioContainer: {
    marginBottom: Spacing.md,
  },
  bioText: {
    color: Colors.muted,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: Spacing.xs,
    minWidth: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    color: Colors.muted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    padding: 0,
  },
  modalScroll: {
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  closeButton: {
    padding: 4,
  },
  expertProfileHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  expertLargeAvatarContainer: {
    marginRight: Spacing.md,
  },
  expertLargeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  expertLargeAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  expertDetailInfo: {
    flex: 1,
  },
  emailDetailText: {
    color: Colors.muted,
    marginBottom: 6,
  },
  statusDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSection: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  detailSectionTitle: {
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  detailText: {
    color: Colors.dark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
  },
  modalButton: {
    minWidth: 120,
  },
});

export default ExpertVerification; 