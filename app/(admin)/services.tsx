import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Switch } from 'react-native';
import { Text, Container, Card, Button, TopNav } from '../components/UI';
import { SafeIcon } from '../components/UI/SafeIcon';
import { Colors, Spacing } from '../constants';
import { useRouter } from 'expo-router';
import { getDocuments, updateDocument, createDocument, deleteDocument } from '../lib/db/firestore';
import { Service } from '../lib/db/types';

const ServiceManagement = () => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const fetchedServices = await getDocuments<Service>('services');
      setServices(fetchedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to fetch services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!formData.name || !formData.description || !formData.category || formData.basePrice <= 0) {
      Alert.alert('Validation Error', 'Please fill all required fields with valid values.');
      return;
    }

    try {
      const newService = await createDocument<Service>('services', {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: formData.basePrice,
        isActive: formData.isActive
      });
      
      setServices(prev => [...prev, newService]);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Service added successfully');
    } catch (error) {
      console.error('Error adding service:', error);
      Alert.alert('Error', 'Failed to add service. Please try again.');
    }
  };

  const handleUpdateService = async (serviceId: string, updatedData: Partial<Service>) => {
    try {
      await updateDocument<Service>('services', serviceId, updatedData);
      
      // Update local state
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId ? { ...service, ...updatedData } : service
        )
      );
      
      setSelectedService(null);
      Alert.alert('Success', 'Service updated successfully');
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument('services', serviceId);
              
              // Update local state
              setServices(prevServices => 
                prevServices.filter(service => service.id !== serviceId)
              );
              
              Alert.alert('Success', 'Service deleted successfully');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      basePrice: 0,
      isActive: true
    });
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ServiceItem = ({ service }: { service: Service }) => {
    return (
      <Card style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Text variant="h3" weight="bold">{service.name}</Text>
          <View style={{
            ...styles.statusBadge, 
            ...(service.isActive ? styles.activeBadge : styles.inactiveBadge)
          }}>
            <Text style={styles.statusText}>
              {service.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={styles.categoryText}>Category: {service.category}</Text>
        <Text style={styles.priceText}>Base Price: ₦{service.basePrice.toFixed(2)}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>{service.description}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedService(service);
              setFormData({
                name: service.name,
                description: service.description,
                category: service.category,
                basePrice: service.basePrice,
                isActive: service.isActive
              });
            }}
          >
            <SafeIcon name="Edit" size={20} color={Colors.primary} />
            <Text style={{...styles.actionText, color: Colors.primary}}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteService(service.id)}
          >
            <SafeIcon name="Trash" size={20} color={Colors.danger} />
            <Text style={{...styles.actionText, color: Colors.danger}}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleUpdateService(service.id, { isActive: !service.isActive })}
          >
            <SafeIcon 
              name={service.isActive ? "EyeOff" : "Eye"} 
              size={20} 
              color={service.isActive ? Colors.warning : Colors.success} 
            />
            <Text style={{
              ...styles.actionText, 
              color: service.isActive ? Colors.warning : Colors.success
            }}>
              {service.isActive ? 'Disable' : 'Enable'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const ServiceModal = () => {
    const isEditMode = selectedService !== null;
    
    return (
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContainer}>
          <Text variant="h2" weight="bold" style={styles.modalTitle}>
            {isEditMode ? 'Edit Service' : 'Add New Service'}
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Service name"
              placeholderTextColor={Colors.muted}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category:</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
              placeholder="Service category"
              placeholderTextColor={Colors.muted}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Base Price (₦):</Text>
            <TextInput
              style={styles.input}
              value={formData.basePrice.toString()}
              onChangeText={(text) => {
                const numericValue = parseFloat(text) || 0;
                setFormData(prev => ({ ...prev, basePrice: numericValue }));
              }}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={Colors.muted}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={{...styles.input, ...styles.textArea}}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Service description"
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={{...styles.formGroup, ...styles.switchContainer}}>
            <Text style={styles.label}>Active:</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
              trackColor={{ false: Colors.muted, true: Colors.primary + '80' }}
              thumbColor={formData.isActive ? Colors.primary : Colors.light}
            />
          </View>
          
          <View style={styles.modalActions}>
            <Button 
              title="Cancel" 
              onPress={() => {
                isEditMode ? setSelectedService(null) : setShowAddModal(false);
                resetForm();
              }} 
              variant="secondary"
              style={styles.modalButton}
            />
            <Button 
              title={isEditMode ? "Update" : "Add"} 
              onPress={() => {
                if (isEditMode) {
                  handleUpdateService(selectedService.id, formData);
                } else {
                  handleAddService();
                }
              }} 
              style={styles.modalButton}
            />
          </View>
        </Card>
      </View>
    );
  };

  return (
    <>
      <TopNav title="Service Management" />
      <Container>
        <View style={styles.toolbar}>
          <View style={styles.searchContainer}>
            <SafeIcon name="Search" size={20} color={Colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <SafeIcon name="X" size={20} color={Colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <SafeIcon name="Plus" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <ScrollView style={styles.serviceList} showsVerticalScrollIndicator={false}>
            {filteredServices.length === 0 ? (
              <View style={styles.emptyState}>
                <SafeIcon name="Briefcase" size={48} color={Colors.muted} />
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No services matching your search' : 'No services found'}
                </Text>
                {!searchQuery && (
                  <Button 
                    title="Add Service" 
                    onPress={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
            ) : (
              filteredServices.map(service => <ServiceItem key={service.id} service={service} />)
            )}
          </ScrollView>
        )}

        {(showAddModal || selectedService) && <ServiceModal />}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceList: {
    flex: 1,
  },
  serviceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: Colors.success + '20',
  },
  inactiveBadge: {
    backgroundColor: Colors.warning + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryText: {
    color: Colors.dark,
    marginBottom: 2,
  },
  priceText: {
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  descriptionText: {
    color: Colors.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    color: Colors.muted,
    marginTop: Spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: Spacing.sm,
  },
  actionText: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '500',
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
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateButton: {
    minWidth: 150,
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
    padding: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.dark,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    color: Colors.dark,
  },
  textArea: {
    minHeight: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: Spacing.sm,
  },
});

export default ServiceManagement; 