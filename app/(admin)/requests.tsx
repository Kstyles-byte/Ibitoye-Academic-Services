import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Text, Container, Card, Button, TopNav } from '../components/UI';
import { Colors, Spacing } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getDocuments, updateDocument, getDocumentById } from '../lib/db/firestore';
import { ServiceRequest, RequestStatus, Client, User, Service } from '../lib/db/types';

interface RequestWithDetails extends ServiceRequest {
  client?: {
    data: Client;
    user?: User;
  };
  service?: Service;
}

const statusColors = {
  [RequestStatus.PENDING]: Colors.warning,
  [RequestStatus.APPROVED]: Colors.primary,
  [RequestStatus.ASSIGNED]: Colors.primary,
  [RequestStatus.IN_PROGRESS]: Colors.primary,
  [RequestStatus.COMPLETED]: Colors.success,
  [RequestStatus.CANCELLED]: Colors.danger,
  [RequestStatus.REJECTED]: Colors.danger,
};

const RequestMonitoring = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const requestDocs = await getDocuments<ServiceRequest>('serviceRequests');
      
      // Fetch additional details for each request
      const requestsWithDetails: RequestWithDetails[] = await Promise.all(
        requestDocs.map(async (request): Promise<RequestWithDetails> => {
          const enrichedRequest: RequestWithDetails = { ...request };
          
          try {
            // Get service details
            const serviceData = await getDocumentById<Service>('services', request.serviceId);
            if (serviceData) {
              enrichedRequest.service = serviceData;
            }
            
            // Get client details
            const clientData = await getDocumentById<Client>('clients', request.clientId);
            if (clientData) {
              enrichedRequest.client = { data: clientData };
              
              // Get client user details
              try {
                const userData = await getDocumentById<User>('users', clientData.userId);
                if (userData) {
                  enrichedRequest.client.user = userData;
                }
              } catch (error) {
                console.error(`Error fetching user data for client ${clientData.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching details for request ${request.id}:`, error);
          }
          
          return enrichedRequest;
        })
      );
      
      setRequests(requestsWithDetails);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    try {
      await updateDocument<ServiceRequest>('serviceRequests', requestId, { status: newStatus });
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
      
      setSelectedRequest(null);
      Alert.alert('Success', 'Request status updated successfully');
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status. Please try again.');
    }
  };

  const filteredRequests = requests.filter(request => {
    // Apply status filter
    if (statusFilter !== 'ALL' && request.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    return (
      (request.subject && request.subject.toLowerCase().includes(searchLower)) ||
      (request.requirements && request.requirements.toLowerCase().includes(searchLower)) ||
      (request.client?.user?.name && request.client.user.name.toLowerCase().includes(searchLower)) ||
      (request.client?.user?.email && request.client.user.email.toLowerCase().includes(searchLower)) ||
      (request.service?.name && request.service.name.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const RequestItem = ({ request }: { request: RequestWithDetails }) => {
    const statusColor = statusColors[request.status] || Colors.muted;
    
    return (
      <Card style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text variant="h3" weight="bold">{request.subject}</Text>
            <Text style={styles.serviceInfo}>
              {request.service?.name || 'Unknown Service'} • {request.academicLevel}
            </Text>
          </View>
          <View style={{
            ...styles.statusBadge,
            backgroundColor: statusColor + '20'
          }}>
            <Text style={{
              ...styles.statusText,
              color: statusColor
            }}>
              {request.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color={Colors.muted} />
            <Text style={styles.detailText}>
              {request.client?.user?.name || 'Unknown Client'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
            <Text style={styles.detailText}>
              Deadline: {formatDate(request.deadline)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={Colors.muted} />
            <Text style={styles.detailText}>
              Created: {formatDate(request.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <Button
            title="View Details"
            onPress={() => setSelectedRequest(request)}
            variant="secondary"
            style={styles.actionButton}
          />
          
          {request.status === RequestStatus.PENDING && (
            <>
              <Button
                title="Approve"
                onPress={() => handleUpdateRequestStatus(request.id, RequestStatus.APPROVED)}
                style={styles.actionButton}
              />
              <Button
                title="Reject"
                onPress={() => handleUpdateRequestStatus(request.id, RequestStatus.REJECTED)}
                variant="danger"
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </Card>
    );
  };

  const RequestDetailModal = () => {
    if (!selectedRequest) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text variant="h2" weight="bold">Request Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedRequest(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Subject</Text>
              <Text style={styles.detailText}>{selectedRequest.subject}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Service</Text>
              <Text style={styles.detailText}>
                {selectedRequest.service?.name || 'Unknown Service'}
              </Text>
              <Text style={styles.detailSubtext}>
                Category: {selectedRequest.service?.category || 'N/A'}
              </Text>
              <Text style={styles.detailSubtext}>
                Base Price: ₦{selectedRequest.service?.basePrice.toFixed(2) || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Client</Text>
              <Text style={styles.detailText}>
                {selectedRequest.client?.user?.name || 'Unknown Client'}
              </Text>
              <Text style={styles.detailSubtext}>
                Email: {selectedRequest.client?.user?.email || 'N/A'}
              </Text>
              <Text style={styles.detailSubtext}>
                Institution: {selectedRequest.client?.data.institution || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Academic Details</Text>
              <Text style={styles.detailText}>
                Level: {selectedRequest.academicLevel}
              </Text>
              <Text style={styles.detailSubtext}>
                Deadline: {formatDate(selectedRequest.deadline)}
              </Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Requirements</Text>
              <Text style={styles.detailText}>{selectedRequest.requirements}</Text>
            </View>
            
            {selectedRequest.additionalInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Additional Information</Text>
                <Text style={styles.detailText}>{selectedRequest.additionalInfo}</Text>
              </View>
            )}
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Status</Text>
              <View style={{
                ...styles.statusLargeBadge,
                backgroundColor: statusColors[selectedRequest.status] + '20'
              }}>
                <Text style={{
                  ...styles.statusLargeText,
                  color: statusColors[selectedRequest.status]
                }}>
                  {selectedRequest.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Timeline</Text>
              <Text style={styles.detailSubtext}>
                Created: {formatDate(selectedRequest.createdAt)}
              </Text>
              <Text style={styles.detailSubtext}>
                Last Updated: {formatDate(selectedRequest.updatedAt)}
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              {selectedRequest.status === RequestStatus.PENDING && (
                <>
                  <Button
                    title="Approve Request"
                    onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.APPROVED)}
                    style={{...styles.modalButton, marginRight: Spacing.sm}}
                  />
                  <Button
                    title="Reject Request"
                    onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.REJECTED)}
                    variant="danger"
                    style={{...styles.modalButton, marginRight: Spacing.sm}}
                  />
                </>
              )}
              
              {selectedRequest.status === RequestStatus.APPROVED && (
                <Button
                  title="Mark as Assigned"
                  onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.ASSIGNED)}
                  style={{...styles.modalButton, marginRight: Spacing.sm}}
                />
              )}
              
              {selectedRequest.status === RequestStatus.IN_PROGRESS && (
                <Button
                  title="Mark as Completed"
                  onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.COMPLETED)}
                  style={{...styles.modalButton, marginRight: Spacing.sm}}
                />
              )}
              
              <Button
                title="Close"
                onPress={() => setSelectedRequest(null)}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </ScrollView>
        </Card>
      </View>
    );
  };

  const renderStatusFilter = (status: RequestStatus | 'ALL', label: string) => (
    <TouchableOpacity 
      style={{
        ...styles.filterButton,
        ...(statusFilter === status ? styles.activeFilter : {})
      }}
      onPress={() => setStatusFilter(status)}
    >
      <Text style={{
        ...styles.filterText,
        ...(statusFilter === status ? styles.activeFilterText : {})
      }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TopNav title="Request Monitoring" />
      <Container>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {renderStatusFilter('ALL', 'All Requests')}
          {renderStatusFilter(RequestStatus.PENDING, 'Pending')}
          {renderStatusFilter(RequestStatus.APPROVED, 'Approved')}
          {renderStatusFilter(RequestStatus.ASSIGNED, 'Assigned')}
          {renderStatusFilter(RequestStatus.IN_PROGRESS, 'In Progress')}
          {renderStatusFilter(RequestStatus.COMPLETED, 'Completed')}
          {renderStatusFilter(RequestStatus.CANCELLED, 'Cancelled')}
          {renderStatusFilter(RequestStatus.REJECTED, 'Rejected')}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : (
          <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
            {filteredRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text" size={48} color={Colors.muted} />
                <Text style={styles.emptyStateText}>
                  {searchQuery 
                    ? 'No requests matching your search' 
                    : statusFilter !== 'ALL'
                      ? `No ${statusFilter.toLowerCase()} requests found`
                      : 'No requests found'}
                </Text>
              </View>
            ) : (
              filteredRequests.map(request => (
                <RequestItem key={request.id} request={request} />
              ))
            )}
          </ScrollView>
        )}

        {selectedRequest && <RequestDetailModal />}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.dark,
  },
  filterScrollView: {
    marginBottom: Spacing.md,
    height: 40,
  },
  filterContainer: {
    paddingRight: Spacing.md,
    height: 36,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
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
  requestsList: {
    flex: 1,
  },
  requestCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  serviceInfo: {
    color: Colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDetails: {
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    color: Colors.dark,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.light,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    marginLeft: Spacing.xs,
    minWidth: 90,
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
  detailSubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  statusLargeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusLargeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
  },
  modalButton: {
    minWidth: 140,
    marginBottom: Spacing.sm,
  },
});

export default RequestMonitoring; 