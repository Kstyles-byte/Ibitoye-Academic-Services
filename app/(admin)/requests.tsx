import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Alert, Animated, Platform, Linking } from 'react-native';
import { Text, Container, Card, Button, TopNav } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing } from '../constants';
import { useRouter } from 'expo-router';
import { getDocuments, updateDocument, getDocumentById, subscribeToCollection } from '../lib/db/firestore';
import { ServiceRequest, RequestStatus, Client, User, Service, Attachment, Role } from '../lib/db/types';
import { getAttachmentsByServiceRequestId } from '../lib/db/repositories/serviceRequestRepository';

interface RequestWithDetails extends ServiceRequest {
  client?: {
    data: Client;
    user?: User;
  };
  service?: Service;
  isNew?: boolean;
  attachments?: Attachment[];
  budget?: number;
  [key: string]: any; // Add index signature to allow dynamic field access
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

// Helper function to get the user's display name, handling both name and displayName fields
const getUserDisplayName = (user?: User): string => {
  if (!user) return 'Unknown Client';
  return user.displayName || user.name || 'Unknown Client';
};

const RequestMonitoring = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const unsubscribeRef = useRef<() => void | null>();
  const [timeRefresh, setTimeRefresh] = useState(0); // State to trigger time updates
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh toggle
  
  // Cache for users to avoid repeated fetches
  const userCache = useRef<Record<string, User>>({});

  // Utility function to get user by ID, with caching
  const getUserById = async (userId: string): Promise<User | null> => {
    // If in cache, return immediately
    if (userCache.current[userId]) {
      return userCache.current[userId];
    }
    
    try {
      // Try to get user directly from users collection
      const userData = await getDocumentById<User>('users', userId);
      if (userData) {
        userCache.current[userId] = userData;
        return userData;
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
    }
    
    return null;
  };

  useEffect(() => {
    setupRealTimeSubscription();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Set up a timer to update the relative timestamps every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRefresh(prev => prev + 1);
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Set up auto-refresh timer (every 5 minutes)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const refreshTimer = setInterval(() => {
      refreshRequests();
    }, 300000); // Auto-refresh every 5 minutes
    
    return () => clearInterval(refreshTimer);
  }, [autoRefresh]);

  const setupRealTimeSubscription = () => {
    setLoading(true);
    
    try {
      const unsubscribe = subscribeToCollection<ServiceRequest>(
        'serviceRequests',
        async (requestDocs) => {
          const requestsWithDetails = await Promise.all(
            requestDocs.map(async (request) => {
              // Initialize with basic structure to avoid null/undefined issues
              const enrichedRequest: RequestWithDetails = { 
                ...request,
                client: {
                  data: {} as Client,
                  user: {
                    id: 'unknown',
                    email: 'N/A',
                    role: 'CLIENT', 
                    displayName: 'Unknown Client',
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt
                  } as User
                }
              };
              
              // Ensure budget is a number if present
              if (request.budget !== undefined) {
                if (typeof request.budget === 'string') {
                  // Convert string budget to number
                  enrichedRequest.budget = parseFloat(request.budget);
                } else if (typeof request.budget === 'object' && request.budget !== null) {
                  // Handle possible Firestore number object
                  const budgetObj = request.budget as any;
                  if ('value' in budgetObj) {
                    enrichedRequest.budget = budgetObj.value;
                  } else if ('amount' in budgetObj) {
                    enrichedRequest.budget = budgetObj.amount;
                  }
                } else {
                  // Keep as is if it's already a number or null
                  enrichedRequest.budget = request.budget;
                }
              } else {
                // Try to find budget in other possible fields
                if ('amount' in request) {
                  enrichedRequest.budget = (request as any).amount;
                } else if ('payment' in request && typeof (request as any).payment === 'object') {
                  enrichedRequest.budget = (request as any).payment.amount;
                } else if ('price' in request) {
                  enrichedRequest.budget = (request as any).price;
                } else if ('basePrice' in request) {
                  enrichedRequest.budget = (request as any).basePrice;
                }
              }
              
              // Enhanced budget debugging
              console.log(`Request ${request.id} budget processing:`, {
                initialBudget: request.budget,
                initialBudgetType: typeof request.budget,
                processedBudget: enrichedRequest.budget,
                processedBudgetType: typeof enrichedRequest.budget,
                hasAmount: 'amount' in request,
                hasPayment: 'payment' in request,
                hasPrice: 'price' in request,
                hasBasePrice: 'basePrice' in request,
                allFields: Object.keys(request).filter(key => 
                  typeof (request as any)[key] === 'number' || 
                  (typeof (request as any)[key] === 'string' && !isNaN(parseFloat((request as any)[key])))
                )
              });
              
              // Try to extract budget from requirements or additionalInfo as a last resort
              if (enrichedRequest.budget === undefined && (request.requirements || request.additionalInfo)) {
                const textToSearch = (request.requirements || '') + ' ' + (request.additionalInfo || '');
                // Look for budget patterns like "budget: 5000" or "budget is 5000" or "₦5000"
                const budgetMatches = textToSearch.match(/budget:?\s*(\d[\d,]*(\.\d+)?)|₦\s*(\d[\d,]*(\.\d+)?)/i);
                if (budgetMatches) {
                  const matchedValue = budgetMatches[1] || budgetMatches[3];
                  const cleanValue = matchedValue.replace(/,/g, '');
                  const parsedValue = parseFloat(cleanValue);
                  if (!isNaN(parsedValue)) {
                    enrichedRequest.budget = parsedValue;
                    console.log(`Extracted budget ${parsedValue} from text for request ${request.id}`);
                  }
                }
              }
              
              // For debugging - log the full request data to understand structure
              console.log(`Processing request ${request.id}:`, {
                clientId: request.clientId,
                serviceId: request.serviceId,
                subject: request.subject,
                budget: request.budget,
                budgetType: typeof request.budget,
                requestKeys: Object.keys(request)
              });
              
              try {
                const serviceData = await getDocumentById<Service>('services', request.serviceId);
                if (serviceData) {
                  enrichedRequest.service = serviceData;
                }
                
                // NEW APPROACH: Try to get user directly from clientId, assuming it's a Firebase Auth UID
                const directUser = await getUserById(request.clientId);
                if (directUser) {
                  console.log(`Found user directly by clientId ${request.clientId}:`, directUser);
                  
                  // Use this user directly since clientId is the user ID
                  enrichedRequest.client = {
                    data: { 
                      id: directUser.id,
                      userId: directUser.id,
                      // Don't try to copy fields that aren't on the User type
                    } as Client,
                    user: directUser
                  };
                } else {
                  console.log(`No user found directly with ID ${request.clientId}, trying other approaches...`);
                  
                  // Continue with existing approaches...
                  // Fetch client data and associated user data
                  try {
                    // Fallback to original approach - try to find client record
                    const clientData = await getDocumentById<Client>('clients', request.clientId);
                    if (clientData) {
                      enrichedRequest.client = { 
                        data: clientData,
                        user: {
                          id: 'unknown',
                          email: 'N/A',
                          role: 'CLIENT',
                          displayName: 'Unknown Client',
                          createdAt: request.createdAt,
                          updatedAt: request.updatedAt
                        } as User
                      };
                      
                      console.log(`Client data found for clientId ${request.clientId}:`, clientData);
                      
                      if (clientData.userId) {
                        try {
                          const userDataFromClient = await getDocumentById<User>('users', clientData.userId);
                          if (userDataFromClient) {
                            enrichedRequest.client.user = userDataFromClient;
                            console.log(`User data found through client userId:`, userDataFromClient);
                          }
                        } catch (error) {
                          console.error(`Error fetching user data through client:`, error);
                        }
                      }
                    } else {
                      console.warn(`Client data not found for clientId: ${request.clientId}`);
                    }
                  } catch (error) {
                    console.error(`Error in client/user data fetching:`, error);
                  }
                }
                
                // If we still don't have user data, try alternative approaches
                if (!enrichedRequest.client?.user || getUserDisplayName(enrichedRequest.client?.user) === 'Unknown Client') {
                  console.log(`Trying alternative approaches to find user for request ${request.id}`);
                  
                  // Try getting all users and find a match
                  try {
                    const allUsers = await getDocuments<User>('users', [], '100');
                    console.log(`Loaded ${allUsers.length} users for matching`);
                    
                    // Find a user that matches this clientId
                    for (const user of allUsers) {
                      if (user.id === request.clientId) {
                        // Make sure client is initialized before setting user
                        if (!enrichedRequest.client) {
                          enrichedRequest.client = {
                            data: { id: user.id, userId: user.id } as Client
                          };
                        }
                        enrichedRequest.client.user = user;
                        console.log(`Found matching user by ID:`, user);
                        break;
                      }
                    }
                  } catch (error) {
                    console.error(`Error in fallback user lookup:`, error);
                  }
                }
              } catch (error) {
                console.error(`Error fetching details for request ${request.id}:`, error);
              }
              
              // Fetch attachments for the request
              try {
                const attachments = await getAttachmentsByServiceRequestId(request.id);
                if (attachments && attachments.length > 0) {
                  enrichedRequest.attachments = attachments;
                }
              } catch (error) {
                console.error(`Error fetching attachments for request ${request.id}:`, error);
              }
              
              return enrichedRequest;
            })
          );
          
          // Sort requests by createdAt timestamp (newest first)
          const sortedRequests = requestsWithDetails.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            // Compare timestamps (larger seconds value = more recent)
            return b.createdAt.seconds - a.createdAt.seconds;
          });
          
          // Mark new requests based on timestamp (requests within the last 5 minutes)
          const now = new Date();
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          
          const markedRequests = sortedRequests.map(request => {
            if (request.createdAt) {
              const requestDate = new Date(request.createdAt.seconds * 1000);
              // If the request was created in the last 5 minutes, mark it as new
              request.isNew = requestDate > fiveMinutesAgo;
            }
            return request;
          });
          
          setRequests(markedRequests);
          setLoading(false);
        },
        [], // No conditions by default
        'createdAt', // Sort by createdAt field
        'desc' // Sort in descending order (newest first)
      );
      
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      Alert.alert('Error', 'Failed to set up real-time updates. Please try refreshing.');
      setLoading(false);
    }
  };

  const refreshRequests = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    setupRealTimeSubscription();
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    try {
      await updateDocument<ServiceRequest>('serviceRequests', requestId, { status: newStatus });
      
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
      (getUserDisplayName(request.client?.user) !== 'Unknown Client' && 
        getUserDisplayName(request.client?.user).toLowerCase().includes(searchLower)) ||
      (request.client?.user?.email && request.client.user.email.toLowerCase().includes(searchLower)) ||
      (request.service?.name && request.service.name.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add a function to format time in a relative way (e.g., "2 minutes ago")
  const getRelativeTime = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return 'N/A';
    
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatBudget = (budget: any) => {
    console.log("Budget value in formatBudget:", {
      value: budget,
      type: typeof budget,
      isNumber: typeof budget === 'number',
      isString: typeof budget === 'string',
      stringToNumber: budget && typeof budget === 'string' ? parseFloat(budget) : null
    });
    
    // Handle number type directly
    if (typeof budget === 'number') {
      return budget.toLocaleString();
    }
    
    // Handle string that can be converted to number
    if (typeof budget === 'string' && !isNaN(parseFloat(budget))) {
      return parseFloat(budget).toLocaleString();
    }
    
    // Handle potential object formats (Firestore sometimes stores numbers as objects)
    if (typeof budget === 'object' && budget !== null) {
      if ('value' in budget && typeof budget.value === 'number') {
        return budget.value.toLocaleString();
      }
      if ('amount' in budget && typeof budget.amount === 'number') {
        return budget.amount.toLocaleString();
      }
    }
    
    // If we reach here, return a reasonable fallback value
    return 'N/A';
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

  // Create a RequestItemWrapper that uses the current timeRefresh value
  const RequestItemWrapper = useMemo(() => {
    return ({ request }: { request: RequestWithDetails }) => {
      // Using timeRefresh in the render will make it rerender when timeRefresh changes
      const _ = timeRefresh;
      
      // Create an animated value for new items
      const fadeAnim = useRef(new Animated.Value(request.isNew ? 0 : 1)).current;
      const pulseAnim = useRef(new Animated.Value(1)).current;
      
      // Run the fade-in animation when component mounts
      useEffect(() => {
        if (request.isNew) {
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.7,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            })
          ]).start();
          
          // Start the pulse animation for the new badge
          const pulseAnimation = Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              })
            ])
          );
          
          pulseAnimation.start();
          
          // Stop the animation after 10 seconds
          setTimeout(() => {
            pulseAnimation.stop();
          }, 10000);
        }
      }, []);
      
      const statusColor = statusColors[request.status] || Colors.muted;
      
      return (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card 
            style={{
              ...styles.requestCard,
              ...(request.isNew && styles.newRequestCard)
            }}
          >
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <View style={styles.subjectRow}>
                  <Text variant="h3" weight="bold" style={styles.requestSubject}>{request.subject}</Text>
                  {request.isNew && (
                    <Animated.View 
                      style={[
                        styles.newBadge as any,
                        {transform: [{scale: pulseAnim}]} 
                      ]}
                    >
                      <Text style={styles.newBadgeText}>New</Text>
                    </Animated.View>
                  )}
                </View>
                <Text style={styles.serviceInfo}>
                  {request.service?.name || 'Unknown Service'} • {request.academicLevel}
                </Text>
              </View>
              <View style={{
                ...styles.statusBadge,
                backgroundColor: statusColor + '20'
              }}>
                <Text style={{
                  ...styles.requestStatusText,
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
                  {getUserDisplayName(request.client?.user)}
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
                  Created: {getRelativeTime(request.createdAt)} 
                  <Text style={styles.exactTimeText}>
                    ({formatDate(request.createdAt)})
                  </Text>
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
                <View style={styles.actionButtonGroup}>
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
                </View>
              )}
            </View>
          </Card>
        </Animated.View>
      );
    };
  }, [timeRefresh]); // Only recreate the component when timeRefresh changes

  // Add this helper function near the top of the file, with the other utility functions
  const formatWhatsappNumber = (number: string = ''): string => {
    if (!number) return '';
    
    // Remove any non-digit characters
    const digitsOnly = number.replace(/\D/g, '');
    
    // Handle Nigerian numbers specifically
    if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
      // Convert 0XXXXXXXXXX to 234XXXXXXXXXX
      return '234' + digitsOnly.substring(1);
    } else if (digitsOnly.startsWith('234')) {
      // Already in international format
      return digitsOnly;
    } else if (digitsOnly.startsWith('+234')) {
      // Remove the plus sign
      return digitsOnly.substring(1);
    } else if (digitsOnly.length === 10) {
      // Assume it's a Nigerian number without the leading 0
      return '234' + digitsOnly;
    }
    
    // If it doesn't match any of the expected formats, return as is
    return digitsOnly;
  };

  const RequestDetailModal = () => {
    if (!selectedRequest) return null;
    
    // Debug information about the request with more detail
    console.log("Request Detail Debug:", {
      requestId: selectedRequest.id,
      budget: selectedRequest.budget,
      budgetType: typeof selectedRequest.budget,
      requestKeys: Object.keys(selectedRequest),
      subject: selectedRequest.subject,
      // Log all numeric fields for debugging purposes
      numericFields: Object.entries(selectedRequest)
        .filter(([key, value]) => 
          typeof value === 'number' || 
          (typeof value === 'string' && !isNaN(parseFloat(value))))
        .map(([key, value]) => ({ key, value }))
    });
    
    // Find potential budget values in the request object
    const findPotentialBudget = () => {
      // If we already have a budget, use that
      if (selectedRequest.budget !== undefined) {
        return `₦${formatBudget(selectedRequest.budget)}`;
      }
      
      // Check common fields that might contain budget information
      const possibleFields = ['amount', 'price', 'cost', 'fee', 'payment'];
      for (const field of possibleFields) {
        const value = (selectedRequest as any)[field]; // Use type assertion for dynamic access
        if (value !== undefined && 
            (typeof value === 'number' || 
             (typeof value === 'string' && !isNaN(parseFloat(value))))) {
          return `₦${formatBudget(value)}`;
        }
        
        // Check if field exists as a nested object with amount
        if (typeof value === 'object' && 
            value !== null && 
            'amount' in value) {
          return `₦${formatBudget(value.amount)}`;
        }
      }
      
      // If we have a service with basePrice, use that as fallback
      if (selectedRequest.service?.basePrice) {
        return `₦${selectedRequest.service.basePrice.toLocaleString()} (Service base price)`;
      }
      
      // Look for any field that might be a number and budget-related
      const numericFields = Object.entries(selectedRequest as Record<string, any>)
        .filter(([key, value]) => 
          !['id', 'clientId', 'serviceId'].includes(key) &&
          (typeof value === 'number' || 
           (typeof value === 'string' && !isNaN(parseFloat(value)))))
        .map(([key, value]) => ({ key, value }));
      
      if (numericFields.length > 0) {
        // Log potential budget fields for debugging
        console.log("Potential budget fields found:", numericFields);
        
        // Find the most likely candidate - prefer fields with larger values
        // as they're more likely to be prices
        const mostLikely = numericFields
          .map(({ key, value }) => ({ 
            key, 
            value: typeof value === 'number' ? value : parseFloat(value as string)
          }))
          .sort((a, b) => b.value - a.value)[0];
        
        if (mostLikely) {
          return `₦${mostLikely.value.toLocaleString()} (from ${mostLikely.key})`;
        }
      }
      
      // Check for budget mentions in text fields
      if (selectedRequest.requirements || selectedRequest.additionalInfo) {
        const textToSearch = (selectedRequest.requirements || '') + ' ' + (selectedRequest.additionalInfo || '');
        // Look for budget patterns like "budget: 5000" or "budget is 5000" or "₦5000"
        const budgetMatches = textToSearch.match(/budget:?\s*(\d[\d,]*(\.\d+)?)|₦\s*(\d[\d,]*(\.\d+)?)/i);
        if (budgetMatches) {
          const matchedValue = budgetMatches[1] || budgetMatches[3];
          const cleanValue = matchedValue.replace(/,/g, '');
          const parsedValue = parseFloat(cleanValue);
          if (!isNaN(parsedValue)) {
            return `₦${parsedValue.toLocaleString()} (mentioned in text)`;
          }
        }
      }
      
      return 'Not specified';
    };
    
    // Generate a more detailed budget section with fallbacks
    const generateBudgetSection = () => {
      const budgetDisplay = findPotentialBudget();
      const serviceBasePrice = selectedRequest.service?.basePrice 
        ? `₦${selectedRequest.service.basePrice.toLocaleString()}` 
        : 'N/A';
      
      return {
        id: 'budget',
        title: 'Budget Details',
        icon: "DollarSign",
        content: `Client Budget: ${budgetDisplay}`,
        subcontent: [
          `Service Base Price: ${serviceBasePrice}`,
          budgetDisplay === 'Not specified' 
            ? 'Budget information was not provided with this request' 
            : null
        ].filter(Boolean) // Remove null items
      };
    };

    // Add this section to the detail modal component
    const renderAttachmentsSection = () => {
      if (!selectedRequest.attachments || selectedRequest.attachments.length === 0) {
        return (
          <View style={styles.detailSection}>
            <Text variant="h5" weight="semiBold" style={styles.detailSectionTitle}>
              Attachments
            </Text>
            <Text style={styles.emptyText}>No attachments uploaded</Text>
          </View>
        );
      }

      return (
        <View style={styles.detailSection}>
          <Text variant="h5" weight="semiBold" style={styles.detailSectionTitle}>
            Attachments ({selectedRequest.attachments.length})
          </Text>
          {selectedRequest.attachments.map((attachment, index) => {
            // Ensure we have a valid URL - handle both Cloudinary and local URLs
            const fileUrl = attachment.fileUrl;
            const isCloudinaryUrl = fileUrl && (
              fileUrl.includes('cloudinary.com') || 
              fileUrl.includes('res.cloudinary.com')
            );
            
            // Get a readable filename - either use the stored name or extract from URL
            const displayName = attachment.name || 
              (fileUrl ? fileUrl.split('/').pop() : `File ${index + 1}`);
            
            return (
              <View key={attachment.id || index} style={styles.attachmentItem}>
                <TouchableOpacity 
                  style={styles.attachmentContent}
                  onPress={() => {
                    // Open the file in a new tab/window
                    if (Platform.OS === 'web' && fileUrl) {
                      window.open(fileUrl, '_blank');
                    } else {
                      // For native, show the URL
                      Alert.alert('File URL', fileUrl || 'URL not available');
                    }
                  }}
                >
                  <SafeIcon 
                    name={getFileIconByType(attachment.fileType)} 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text style={styles.attachmentMeta}>
                      {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB • ` : ''}
                      {getFileTypeName(attachment.fileType)}
                      {isCloudinaryUrl ? ' • Cloudinary' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {fileUrl && (
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        // Create an anchor element and trigger download
                        const a = document.createElement('a');
                        a.href = fileUrl;
                        a.download = displayName || 'attachment'; // Ensure we have a valid string for download attribute
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else {
                        // For native platforms
                        Linking.openURL(fileUrl);
                      }
                    }}
                  >
                    <SafeIcon name="Download" size={18} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      );
    };

    // Helper function to get appropriate icon based on file type
    const getFileIconByType = (fileType: string = '') => {
      if (!fileType) return "File";
      
      const type = fileType.toLowerCase();
      if (type.includes('pdf')) return "FileText";
      if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg')) return "Image";
      if (type.includes('word') || type.includes('doc')) return "FileText";
      if (type.includes('excel') || type.includes('sheet') || type.includes('csv')) return "FileSpreadsheet";
      if (type.includes('video')) return "Video";
      if (type.includes('audio')) return "Music";
      if (type.includes('zip') || type.includes('rar')) return "Archive";
      
      return "File";
    };
    
    // Helper function to get readable file type names
    const getFileTypeName = (fileType: string = '') => {
      if (!fileType) return "Unknown";
      
      const type = fileType.toLowerCase();
      if (type.includes('pdf')) return "PDF Document";
      if (type.includes('image')) return "Image";
      if (type.includes('word') || type.includes('doc')) return "Word Document";
      if (type.includes('excel') || type.includes('sheet')) return "Spreadsheet";
      if (type.includes('video')) return "Video";
      if (type.includes('audio')) return "Audio";
      if (type.includes('zip') || type.includes('rar')) return "Archive";
      
      return fileType;
    };

    // Now update the renderClientContactSection function
    const renderClientContactSection = () => {
      // Print debug info to console about the selected request
      console.log("Selected request client structure:", {
        clientId: selectedRequest.clientId,
        client: selectedRequest.client,
        hasUserData: getUserDisplayName(selectedRequest.client?.user) !== 'Unknown Client' || 
                     selectedRequest.client?.user?.email !== 'N/A',
        userName: selectedRequest.client?.user?.displayName,
        userEmail: selectedRequest.client?.user?.email,
      });
      
      // Return early with an error message if client data is completely missing
      if (!selectedRequest.client) {
        return (
          <View style={styles.detailSection}>
            <Text variant="h5" weight="semiBold" style={styles.detailSectionTitle}>
              Client Contact
            </Text>
            <Text style={styles.emptyText}>Client information not available</Text>
          </View>
        );
      }
      
      // Look for WhatsApp number in additionalInfo if it's not in the client data
      let whatsappNumber = selectedRequest.client.data?.whatsappNumber;
      
      if (!whatsappNumber && selectedRequest.additionalInfo) {
        // Try to extract WhatsApp number from additionalInfo
        const match = selectedRequest.additionalInfo.match(/WhatsApp:\s*([^\n]+)/);
        if (match && match[1]) {
          whatsappNumber = match[1].trim();
        }
      }
      
      const hasUserData = getUserDisplayName(selectedRequest.client.user) !== 'Unknown Client' || 
                         selectedRequest.client.user?.email !== 'N/A';
                         
      return (
        <View style={styles.detailSection}>
          <Text variant="h5" weight="semiBold" style={styles.detailSectionTitle}>
            Client Contact
          </Text>
          
          {!hasUserData && (
            <View style={styles.warningMessage}>
              <SafeIcon name="AlertTriangle" size={16} color={Colors.warning} />
              <Text style={styles.warningText}>
                User information is missing or incomplete
              </Text>
            </View>
          )}
          
          <View style={styles.contactInfoItem}>
            <SafeIcon name="User" size={16} color={Colors.muted} />
            <Text style={styles.contactInfoText}>
              {getUserDisplayName(selectedRequest.client.user)}
            </Text>
          </View>
          
          <View style={styles.contactInfoItem}>
            <SafeIcon name="Mail" size={16} color={Colors.muted} />
            <Text style={styles.contactInfoText}>
              {selectedRequest.client.user?.email || 'N/A'}
            </Text>
          </View>
          
          {whatsappNumber && (
            <View style={styles.contactInfoItem}>
              <SafeIcon name="MessageCircle" size={16} color={Colors.muted} />
              <Text style={styles.contactInfoText}>
                {whatsappNumber}
                <Text style={styles.whatsappLabel}> (WhatsApp)</Text>
              </Text>
              <TouchableOpacity
                style={styles.openWhatsAppButton}
                onPress={() => {
                  const formattedNumber = formatWhatsappNumber(whatsappNumber);
                  const whatsappUrl = `https://wa.me/${formattedNumber}`;
                  console.log(`Opening WhatsApp URL: ${whatsappUrl} (original: ${whatsappNumber}, formatted: ${formattedNumber})`);
                  Linking.openURL(whatsappUrl);
                }}
              >
                <SafeIcon name="ExternalLink" size={12} color={Colors.white} />
                <Text style={styles.openWhatsAppText}>Chat</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    };

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
          
          {/* Client contact information first for quick access */}
          {renderClientContactSection()}
          
          {/* Show attachments next as they're important */}
          {renderAttachmentsSection()}
          
          <FlatList
            data={[
              { 
                id: 'subject',
                title: 'Request Subject',
                content: selectedRequest.subject,
                icon: "File"
              },
              {
                id: 'service',
                title: 'Service Details',
                icon: "Briefcase",
                content: selectedRequest.service?.name || 'Unknown Service',
                subcontent: [
                  `Category: ${selectedRequest.service?.category || 'N/A'}`,
                  `Base Price: ₦${selectedRequest.service?.basePrice ? selectedRequest.service.basePrice.toLocaleString() : 'N/A'}`
                ]
              },
              {
                id: 'academic',
                title: 'Academic Details',
                icon: "BookOpen",
                content: `Level: ${selectedRequest.academicLevel}`,
                subcontent: [`Deadline: ${formatDate(selectedRequest.deadline)}`]
              },
              generateBudgetSection(),
              {
                id: 'requirements',
                title: 'Requirements & Specifications',
                icon: "FileText",
                content: selectedRequest.requirements
              },
              ...(selectedRequest.additionalInfo ? [{
                id: 'additional',
                title: 'Additional Information',
                icon: "Info",
                content: selectedRequest.additionalInfo
              }] : []),
              {
                id: 'status',
                title: 'Request Status',
                icon: "Activity",
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
                ),
                subcontent: [
                  `Created: ${formatDate(selectedRequest.createdAt)}`,
                  `Last Updated: ${formatDate(selectedRequest.updatedAt)}`
                ]
              }
            ]}
            renderItem={({ item }) => (
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  {item.icon && <SafeIcon name={item.icon as any} size={20} color={Colors.primary} style={styles.sectionIcon} />}
                  <Text variant="h5" weight="semiBold" style={styles.detailSectionTitle}>
                    {item.title}
                  </Text>
                </View>
                {item.content && <Text style={styles.detailContent}>{item.content}</Text>}
                {'customContent' in item && item.customContent}
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
              variant="outline"
              style={styles.modalButton}
            />
            
            {selectedRequest.status === RequestStatus.PENDING && (
              <View style={styles.actionButtonGroup}>
                <Button
                  title="Approve"
                  onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.APPROVED)}
                  style={styles.actionButton}
                />
                <Button
                  title="Reject"
                  onPress={() => handleUpdateRequestStatus(selectedRequest.id, RequestStatus.REJECTED)}
                  variant="danger"
                  style={styles.actionButton}
                />
              </View>
            )}
          </View>
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <TopNav 
        title="Request Monitoring" 
        rightComponent={
          <View style={styles.topNavActions}>
            <TouchableOpacity 
              onPress={() => setAutoRefresh(prev => !prev)} 
              style={[
                styles.autoRefreshButton,
                {backgroundColor: autoRefresh ? Colors.success + '20' : Colors.light}
              ]}
            >
              <SafeIcon 
                name={autoRefresh ? "RefreshCcw" : "Pause"} 
                size={16} 
                color={autoRefresh ? Colors.success : Colors.muted} 
              />
              <Text 
                style={{
                  color: autoRefresh ? Colors.success : Colors.muted,
                  fontSize: 12,
                  fontWeight: '500',
                  marginLeft: 4,
                }}
              >
                {autoRefresh ? 'Auto' : 'Manual'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={refreshRequests} style={styles.refreshButton}>
              <SafeIcon name="RefreshCw" size={20} color={Colors.primary} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.container}>
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
        
        {/* Real-time status indicator */}
        <View style={styles.realtimeStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.realtimeStatusText}>Real-time updates active</Text>
        </View>
        
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
            <Button
              title="Refresh"
              onPress={refreshRequests}
              variant="secondary"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={({ item }) => <RequestItemWrapper request={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.requestList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
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
  requestStatusText: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    padding: Spacing.lg,
    borderWidth: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.light,
  },
  modalScrollContent: {
    paddingBottom: Spacing.lg,
  },
  detailSection: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  detailSectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.dark,
    fontSize: 18,
  },
  detailContent: {
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  detailSubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  modalButton: {
    minWidth: 100,
  },
  actionButtonGroup: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: Spacing.sm,
    minWidth: 120,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  refreshText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  realtimeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  realtimeStatusText: {
    fontSize: 12,
    color: Colors.muted,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  newRequestCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  newBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: Spacing.xs,
  },
  newBadgeText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  exactTimeText: {
    fontSize: 12,
    color: Colors.muted,
  },
  topNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    marginRight: Spacing.sm,
  },
  emptyText: {
    color: Colors.muted,
    fontStyle: 'italic',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 8,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  attachmentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.dark,
  },
  attachmentMeta: {
    fontSize: 12,
    color: Colors.muted,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  contactInfoText: {
    marginLeft: Spacing.sm,
    color: Colors.dark,
  },
  whatsappLabel: {
    color: Colors.primary,
    fontStyle: 'italic',
  },
  openWhatsAppButton: {
    marginLeft: Spacing.sm,
    backgroundColor: '#25D366', // WhatsApp green
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openWhatsAppText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  warningMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  warningText: {
    color: Colors.warning,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionIcon: {
    marginRight: Spacing.sm,
  },
});

export default RequestMonitoring; 