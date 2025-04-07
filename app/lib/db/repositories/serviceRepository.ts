import { 
  getDocumentById, 
  getDocuments, 
  createDocument,
  updateDocument, 
  deleteDocument 
} from '../firestore';
import { Service } from '../types';

const SERVICES_COLLECTION = 'services';

// Get service by ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  return await getDocumentById<Service>(SERVICES_COLLECTION, id);
};

// Get all services
export const getAllServices = async (activeOnly: boolean = false): Promise<Service[]> => {
  if (activeOnly) {
    return await getDocuments<Service>(
      SERVICES_COLLECTION,
      [{ field: 'isActive', operator: '==', value: true }]
    );
  } else {
    return await getDocuments<Service>(SERVICES_COLLECTION);
  }
};

// Get services by category
export const getServicesByCategory = async (category: string, activeOnly: boolean = true): Promise<Service[]> => {
  const conditions = [{ field: 'category', operator: '==', value: category }];
  
  if (activeOnly) {
    conditions.push({ field: 'isActive', operator: '==', value: true });
  }
  
  return await getDocuments<Service>(
    SERVICES_COLLECTION,
    conditions,
    'basePrice',
    'asc'
  );
};

// Create service
export const createService = async (
  data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Service> => {
  return await createDocument<Service>(SERVICES_COLLECTION, data);
};

// Update service
export const updateService = async (
  id: string, 
  data: Partial<Service>
): Promise<void> => {
  await updateDocument<Service>(SERVICES_COLLECTION, id, data);
};

// Delete service
export const deleteService = async (id: string): Promise<void> => {
  await deleteDocument(SERVICES_COLLECTION, id);
};

// Search services by name
export const searchServicesByName = async (searchQuery: string): Promise<Service[]> => {
  // Note: This is a simplified search that only works with exact matches
  // In a real application, you would need to use Firestore's full-text search capabilities
  // or a third-party service like Algolia
  return await getDocuments<Service>(
    SERVICES_COLLECTION,
    [{ field: 'name', operator: '>=', value: searchQuery }],
    'name',
    'asc'
  );
};

// Get services with price range
export const getServicesWithPriceRange = async (
  minPrice: number, 
  maxPrice: number,
  activeOnly: boolean = true
): Promise<Service[]> => {
  const conditions = [
    { field: 'basePrice', operator: '>=', value: minPrice },
    { field: 'basePrice', operator: '<=', value: maxPrice }
  ];
  
  if (activeOnly) {
    conditions.push({ field: 'isActive', operator: '==', value: true });
  }
  
  return await getDocuments<Service>(
    SERVICES_COLLECTION,
    conditions,
    'basePrice',
    'asc'
  );
}; 