import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Alert } from 'react-native';
import { Text, Container, Card, Button, TopNav } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing } from '../constants';
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
    let backgroundColor = Colors.light;
    let textColor = Colors.muted;
    
    if (isActive) {
      if (status === 'ALL') {
        backgroundColor = Colors.primary + '20';
        textColor = Colors.primary;
      } else {
        backgroundColor = statusColors[status] + '20';
        textColor = statusColors[status];
      }
    }
    
    return (
      <TouchableOpacity 
        style={[styles.filterButton, { backgroundColor }]}
        onPress={() => setStatusFilter(status)}
      >
        <Text style={{ ...styles.filterText, color: textColor }}>{label}</Text>
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
            <SafeIcon name="User" size={16} color={Colors.muted} />
            <Text style={styles.detailText}>
              {request.client?.user?.name || 'Unknown Client'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <SafeIcon name="Calendar" size={16} color={Colors.muted} />
            <Text style={styles.detailText}>
              Deadline: {formatDate(request.deadline)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <SafeIcon name="Clock" size={16} color={Colors.muted} />
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
              <SafeIcon name="X" size={24} color={Colors.dark} />
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
          />
          
          <View style={styles.modalActions}>
            <Button 
              title="Close" 
              onPress={() => setSelectedRequest(null)} 
              variant="secondary"
              style={styles.modalButton}
            />
            
            {selectedRequest.status === RequestStatus.PENDING && (
              <>
                <Button
                  title="Approve"
                  onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.APPROVED)}
                  style={styles.modalButton}
                />
                <Button
                  title="Reject"
                  onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.REJECTED)}
                  variant="danger"
                  style={styles.modalButton}
                />
              </>
            )}
          </View>
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
          <SafeIcon name="Search" size={20} color={Colors.muted} style={styles.searchIcon} />
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
              { status: 'ALL', label: 'All Requests' },
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
            <SafeIcon name="FileText" size={48} color={Colors.muted} />
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
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.dark,
  },
  filtersWrapper: {
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterList: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    marginRight: Spacing.xs,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  messageText: {
    marginTop: Spacing.md,
    color: Colors.muted,
    textAlign: 'center',
  },
  requestList: {
    paddingBottom: Spacing.xl,
  },
  requestCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  requestInfo: {
    flex: 1,
    marginRight: Spacing.md,
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
    padding: Spacing.md,
    paddingTop: 0,
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
    padding: Spacing.md,
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