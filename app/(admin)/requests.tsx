import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Alert } from 'react-native';
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
      const requestsWithDetails = await Promise.all(
        requestDocs.map(async (request) => {
          const enrichedRequest: RequestWithDetails = { ...request };
          
          try {
            const serviceData = await getDocumentById<Service>('services', request.serviceId);
            if (serviceData) {
              enrichedRequest.service = serviceData;
            }
            
            const clientData = await getDocumentById<Client>('clients', request.clientId);
            if (clientData) {
              enrichedRequest.client = { data: clientData };
              
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
    if (statusFilter !== 'ALL' && request.status !== statusFilter) {
      return false;
    }
    
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

  const StatusFilterItem = ({ status, label }: { status: RequestStatus | 'ALL', label: string }) => {
    const isActive = statusFilter === status;
    
    // Adjust button style based on active state
    return (
      <TouchableOpacity 
        style={{
          ...styles.filterButton,
          ...(isActive ? styles.activeFilter : {}),
          // Ensure first button doesn't have left margin
          marginLeft: status === 'ALL' ? 0 : 4
        }}
        onPress={() => setStatusFilter(status)}
        activeOpacity={0.7}
      >
        <Text 
          style={{
            ...styles.filterText,
            ...(isActive ? styles.activeFilterText : {})
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const RequestItem = ({ request }: { request: RequestWithDetails }) => {
    const statusColor = statusColors[request.status] || Colors.muted;
    
    return (
      <Card style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text variant="h3" weight="bold" style={styles.requestSubject}>{request.subject}</Text>
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
          <View style={styles.modalHeader}>
            <Text variant="h2" weight="bold">Request Details</Text>
            <TouchableOpacity 
              onPress={() => setSelectedRequest(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={[
              { 
                id: 'subject',
                title: 'Subject',
                content: selectedRequest.subject
              },
              {
                id: 'service',
                title: 'Service',
                content: selectedRequest.service?.name || 'Unknown Service',
                subcontent: [
                  `Category: ${selectedRequest.service?.category || 'N/A'}`,
                  `Base Price: ₦${selectedRequest.service?.basePrice.toFixed(2) || 'N/A'}`
                ]
              },
              {
                id: 'client',
                title: 'Client',
                content: selectedRequest.client?.user?.name || 'Unknown Client',
                subcontent: [
                  `Email: ${selectedRequest.client?.user?.email || 'N/A'}`,
                  `Institution: ${selectedRequest.client?.data.institution || 'N/A'}`
                ]
              },
              {
                id: 'academic',
                title: 'Academic Details',
                content: `Level: ${selectedRequest.academicLevel}`,
                subcontent: [`Deadline: ${formatDate(selectedRequest.deadline)}`]
              },
              {
                id: 'requirements',
                title: 'Requirements',
                content: selectedRequest.requirements
              },
              ...(selectedRequest.additionalInfo ? [{
                id: 'additional',
                title: 'Additional Information',
                content: selectedRequest.additionalInfo
              }] : []),
              {
                id: 'status',
                title: 'Status',
                customContent: (
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
                )
              },
              {
                id: 'timeline',
                title: 'Timeline',
                subcontent: [
                  `Created: ${formatDate(selectedRequest.createdAt)}`,
                  `Last Updated: ${formatDate(selectedRequest.updatedAt)}`
                ]
              }
            ]}
            renderItem={({ item }) => (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>{item.title}</Text>
                {item.content && <Text style={styles.detailContent}>{item.content}</Text>}
                {item.customContent}
                {item.subcontent?.map((subtext, index) => (
                  <Text key={index} style={styles.detailSubtext}>{subtext}</Text>
                ))}
              </View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.modalScrollContent}
            ListFooterComponent={
              <View style={styles.modalActions}>
                {selectedRequest.status === RequestStatus.PENDING && (
                  <>
                    <Button
                      title="Approve Request"
                      onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.APPROVED)}
                      style={styles.modalButton}
                    />
                    <Button
                      title="Reject Request"
                      onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.REJECTED)}
                      variant="danger"
                      style={styles.modalButton}
                    />
                  </>
                )}
                
                {selectedRequest.status === RequestStatus.APPROVED && (
                  <Button
                    title="Mark as Assigned"
                    onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.ASSIGNED)}
                    style={styles.modalButton}
                  />
                )}
                
                {selectedRequest.status === RequestStatus.IN_PROGRESS && (
                  <Button
                    title="Mark as Completed"
                    onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.COMPLETED)}
                    style={styles.modalButton}
                  />
                )}
                
                <Button
                  title="Close"
                  onPress={() => setSelectedRequest(null)}
                  variant="secondary"
                  style={styles.modalButton}
                />
              </View>
            }
          />
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <TopNav title="Request Monitoring" />
      
      {/* Main content */}
      <View style={styles.container}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
            placeholderTextColor={Colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Status filters */}
        <View style={styles.filtersWrapper}>
          <FlatList
            horizontal
            data={[
              { status: 'ALL', label: 'All Requests2' },
              { status: RequestStatus.PENDING, label: 'Pending' },
              { status: RequestStatus.APPROVED, label: 'Approved' },
              { status: RequestStatus.ASSIGNED, label: 'Assigned' },
              { status: RequestStatus.IN_PROGRESS, label: 'In Progress' },
              { status: RequestStatus.COMPLETED, label: 'Completed' },
              { status: RequestStatus.CANCELLED, label: 'Cancelled' },
              { status: RequestStatus.REJECTED, label: 'Rejected' }
            ]}
            renderItem={({ item }) => <StatusFilterItem status={item.status as RequestStatus | 'ALL'} label={item.label} />}
            keyExtractor={item => item.status}
            showsHorizontalScrollIndicator={false}
            style={styles.filterList}
            contentContainerStyle={styles.filterContainer}
            bounces={false}
            snapToAlignment="start"
            initialNumToRender={5}
          />
        </View>
        
        {/* Request cards or loading/empty state */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.messageText}>Loading requests...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="document-text" size={48} color={Colors.muted} />
            <Text style={styles.messageText}>
              {searchQuery 
                ? 'No requests matching your search' 
                : statusFilter !== 'ALL'
                  ? `No ${statusFilter.toLowerCase()} requests found`
                  : 'No requests found'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={({ item }) => <RequestItem request={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.requestList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Modal for request details */}
      {selectedRequest && <RequestDetailModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark,
  },
  filtersWrapper: {
    marginBottom: Spacing.lg,
  },
  filterList: {
    height: 40,
  },
  filterContainer: {
    paddingLeft: 0,
    paddingRight: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.background,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeFilterText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    marginTop: Spacing.sm,
    color: Colors.muted,
    textAlign: 'center',
  },
  requestList: {
    paddingBottom: Spacing.md,
  },
  requestCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light,
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
  requestSubject: {
    flexShrink: 1,
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
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light,
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
  modalScrollContent: {
    paddingBottom: Spacing.lg,
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
  detailContent: {
    color: Colors.dark,
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
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalButton: {
    minWidth: 140,
  },
});

export default RequestMonitoring; 