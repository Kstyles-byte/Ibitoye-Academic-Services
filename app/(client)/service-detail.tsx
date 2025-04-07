import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Container, Text, Card, Button } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ServiceDetailPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');

  // Placeholder service data
  const serviceData = {
    id: 1,
    title: 'Essay Writing - History of Art',
    description: 'A comprehensive analysis of modern art history from 1900-1950, focusing on the key movements and influential artists of the period.',
    serviceType: 'Essay Writing',
    academicLevel: 'Undergraduate',
    deadline: '2023-07-15',
    budget: '₦15,000',
    status: 'in-progress',
    progress: 60,
    createdAt: '2023-06-20',
    documents: [
      { id: 1, name: 'Requirements.pdf', date: '2023-06-20' },
      { id: 2, name: 'References.docx', date: '2023-06-21' },
    ],
    expert: {
      id: 1,
      name: 'Dr. Sarah Johnson',
      rating: 4.8,
      completedProjects: 34,
      expertise: 'Art History, Modern Art, Cultural Studies',
      avatar: '👩‍🏫',
    },
  };

  // Placeholder messages data
  const messages = [
    {
      id: 1,
      sender: 'expert',
      content: 'Hello! I have started working on your essay about modern art history. Do you have any specific artists or movements you would like me to focus on?',
      timestamp: '2023-06-21 10:30 AM',
    },
    {
      id: 2,
      sender: 'client',
      content: 'Thanks for getting started! I would really like a focus on Cubism and Picasso in particular.',
      timestamp: '2023-06-21 11:45 AM',
    },
    {
      id: 3,
      sender: 'expert',
      content: 'Perfect, I will make sure to include a substantial section on Cubism and Picasso. I will also explore his influence on other movements. Would you also like information about other contemporaries of Picasso?',
      timestamp: '2023-06-21 01:15 PM',
    },
    {
      id: 4,
      sender: 'client',
      content: 'Yes please. Maybe a comparison with Braque would be good too.',
      timestamp: '2023-06-21 03:20 PM',
    },
  ];

  // Placeholder milestones data
  const milestones = [
    {
      id: 1,
      title: 'Research Phase',
      description: 'Gathering sources and background information',
      completed: true,
      date: '2023-06-25',
    },
    {
      id: 2,
      title: 'First Draft',
      description: 'Completion of the initial draft',
      completed: true,
      date: '2023-07-02',
    },
    {
      id: 3,
      title: 'Revisions',
      description: 'Incorporating feedback and revisions',
      completed: false,
      date: '2023-07-10',
    },
    {
      id: 4,
      title: 'Final Submission',
      description: 'Delivery of the completed essay',
      completed: false,
      date: '2023-07-15',
    },
  ];

  // Render status badge
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

  // Render progress bar
  const renderProgressBar = (progress: number) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  // Handle sending a message
  const [newMessage, setNewMessage] = useState('');
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, you would send the message to an API
    Alert.alert('Message Sent', 'Your message has been sent to the expert.');
    setNewMessage('');
  };

  // Handle requesting a revision
  const handleRequestRevision = () => {
    Alert.alert(
      'Request Revision',
      'Would you like to request a revision for this project?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Request',
          onPress: () => {
            // In a real app, you would send the revision request to an API
            Alert.alert('Revision Requested', 'Your revision request has been sent to the expert.');
          },
        },
      ]
    );
  };

  // Handle cancelling the service
  const handleCancelService = () => {
    Alert.alert(
      'Cancel Service',
      'Are you sure you want to cancel this service? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would send the cancellation request to an API
            Alert.alert('Service Cancelled', 'Your service has been cancelled.');
            router.push('/(client)/dashboard');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Container>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(client)/dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          
          <Text variant="h2" weight="bold" style={styles.title}>
            Service Details
          </Text>
        </View>

        {/* Service Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text variant="h4" weight="semiBold" style={styles.serviceTitle}>
              {serviceData.title}
            </Text>
            {renderStatusBadge(serviceData.status)}
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progress: {serviceData.progress}%</Text>
              <Text style={styles.deadlineText}>Due: {serviceData.deadline}</Text>
            </View>
            {renderProgressBar(serviceData.progress)}
          </View>
          
          <View style={styles.serviceActions}>
            <Button 
              title="Message Expert" 
              variant="primary"
              size="small"
              onPress={() => setActiveTab('messages')}
              style={styles.actionButton}
            />
            <Button 
              title="Request Revision" 
              variant="outline"
              size="small"
              onPress={handleRequestRevision}
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
          >
            <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
              Messages
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'milestones' && styles.activeTab]}
            onPress={() => setActiveTab('milestones')}
          >
            <Text style={[styles.tabText, activeTab === 'milestones' && styles.activeTabText]}>
              Milestones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Details Tab Content */}
        {activeTab === 'details' && (
          <Card style={styles.tabContent}>
            <View style={styles.detailSection}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Service Description
              </Text>
              <Text style={styles.description}>{serviceData.description}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Service Information
              </Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Service Type</Text>
                  <Text style={styles.infoValue}>{serviceData.serviceType}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Academic Level</Text>
                  <Text style={styles.infoValue}>{serviceData.academicLevel}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Created On</Text>
                  <Text style={styles.infoValue}>{serviceData.createdAt}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Budget</Text>
                  <Text style={styles.infoValue}>{serviceData.budget}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Attached Documents
              </Text>
              
              {serviceData.documents.map(doc => (
                <View key={doc.id} style={styles.documentItem}>
                  <View style={styles.documentInfo}>
                    <Ionicons name="document" size={18} color={Colors.primary} />
                    <Text style={styles.documentName}>{doc.name}</Text>
                  </View>
                  <Text style={styles.documentDate}>{doc.date}</Text>
                </View>
              ))}
              
              <Button 
                title="Upload Document" 
                variant="outline"
                size="small"
                onPress={() => Alert.alert('Upload', 'Document upload functionality would be integrated here.')}
                style={styles.uploadButton}
              />
            </View>
            
            <View style={styles.detailSection}>
              <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
                Assigned Expert
              </Text>
              
              <Card style={styles.expertCard}>
                <View style={styles.expertHeader}>
                  <Text style={styles.expertAvatar}>{serviceData.expert.avatar}</Text>
                  <View style={styles.expertInfo}>
                    <Text variant="h5" weight="semiBold" style={styles.expertName}>
                      {serviceData.expert.name}
                    </Text>
                    <View style={styles.expertRating}>
                      <Ionicons name="star" size={16} color={Colors.warning} />
                      <Text style={styles.expertRatingText}>{serviceData.expert.rating}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.expertDetails}>
                  <Text style={styles.expertDetailLabel}>Expertise:</Text>
                  <Text style={styles.expertDetailText}>{serviceData.expert.expertise}</Text>
                  
                  <Text style={styles.expertDetailLabel}>Completed Projects:</Text>
                  <Text style={styles.expertDetailText}>{serviceData.expert.completedProjects}</Text>
                </View>
              </Card>
            </View>
            
            <View style={styles.detailSection}>
              <Button 
                title="Cancel Service" 
                variant="danger"
                onPress={handleCancelService}
                style={styles.cancelButton}
              />
            </View>
          </Card>
        )}

        {/* Messages Tab Content */}
        {activeTab === 'messages' && (
          <Card style={styles.tabContent}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
              Messages with Expert
            </Text>
            
            <View style={styles.messagesContainer}>
              {messages.map(message => (
                <View 
                  key={message.id} 
                  style={[
                    styles.messageItem,
                    message.sender === 'client' ? styles.clientMessage : styles.expertMessage
                  ]}
                >
                  <Text style={styles.messageContent}>{message.content}</Text>
                  <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message here..."
                multiline
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Milestones Tab Content */}
        {activeTab === 'milestones' && (
          <Card style={styles.tabContent}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>
              Project Milestones
            </Text>
            
            <View style={styles.timelineContainer}>
              {milestones.map((milestone, index) => (
                <View key={milestone.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View 
                      style={[
                        styles.timelineDot,
                        milestone.completed ? styles.completedDot : styles.pendingDot
                      ]}
                    >
                      {milestone.completed && (
                        <Ionicons name="checkmark" size={16} color={Colors.white} />
                      )}
                    </View>
                    {index < milestones.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <Text variant="h5" weight="semiBold" style={styles.milestoneName}>
                      {milestone.title}
                    </Text>
                    <Text style={styles.milestoneDescription}>
                      {milestone.description}
                    </Text>
                    <Text style={styles.milestoneDate}>
                      Due: {milestone.date}
                    </Text>
                    {milestone.completed && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButtonText: {
    marginLeft: Spacing.xs,
    color: Colors.primary,
  },
  title: {
    marginBottom: Spacing.md,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressText: {
    fontWeight: '500',
  },
  deadlineText: {
    color: Colors.muted,
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
  },
  actionButton: {
    marginRight: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontWeight: '500',
    color: Colors.muted,
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabContent: {
    marginBottom: Spacing.xxl,
  },
  detailSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs / 2,
  },
  infoValue: {
    color: Colors.muted,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    marginLeft: Spacing.xs,
  },
  documentDate: {
    color: Colors.muted,
    fontSize: 12,
  },
  uploadButton: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  expertCard: {
    padding: Spacing.md,
  },
  expertHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  expertAvatar: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  expertInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  expertName: {
    marginBottom: Spacing.xs / 2,
  },
  expertRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertRatingText: {
    marginLeft: Spacing.xs / 2,
    fontWeight: '500',
  },
  expertDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: Spacing.md,
  },
  expertDetailLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs / 2,
  },
  expertDetailText: {
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
  messagesContainer: {
    marginBottom: Spacing.lg,
  },
  messageItem: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Layout.borderRadius.medium,
    maxWidth: '85%',
  },
  clientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  expertMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  messageContent: {
    color: props => props.style && props.style.backgroundColor === Colors.primary ? Colors.white : Colors.dark,
    marginBottom: Spacing.xs,
  },
  messageTimestamp: {
    fontSize: 10,
    color: props => props.style && props.style.backgroundColor === Colors.primary ? Colors.white : Colors.muted,
    opacity: 0.8,
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Layout.borderRadius.medium,
    padding: Spacing.sm,
    maxHeight: 100,
    minHeight: 50,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  timelineContainer: {
    paddingLeft: Spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  completedDot: {
    backgroundColor: Colors.success,
  },
  pendingDot: {
    backgroundColor: Colors.muted,
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: '#eee',
  },
  timelineContent: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  milestoneName: {
    marginBottom: Spacing.xs,
  },
  milestoneDescription: {
    marginBottom: Spacing.xs,
  },
  milestoneDate: {
    fontSize: 12,
    color: Colors.muted,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Layout.borderRadius.small,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  completedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ServiceDetailPage; 