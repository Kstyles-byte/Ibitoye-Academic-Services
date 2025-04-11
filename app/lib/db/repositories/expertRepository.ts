import { 
  getDocumentById, 
  getDocuments, 
  createDocumentWithId,
  updateDocument, 
  deleteDocument,
  createDocument 
} from '../firestore';
import { Expert, ExpertiseArea, ServiceAssignment, AssignmentStatus, Deliverable } from '../types';
import { deleteLocalFile } from '../../cloudinary';

const EXPERTS_COLLECTION = 'experts';
const EXPERTISE_AREAS_COLLECTION = 'expertiseAreas';
const SERVICE_ASSIGNMENTS_COLLECTION = 'serviceAssignments';
const DELIVERABLES_COLLECTION = 'deliverables';

// Get expert by ID
export const getExpertById = async (id: string): Promise<Expert | null> => {
  return await getDocumentById<Expert>(EXPERTS_COLLECTION, id);
};

// Get expert by user ID
export const getExpertByUserId = async (userId: string): Promise<Expert | null> => {
  const experts = await getDocuments<Expert>(
    EXPERTS_COLLECTION,
    [{ field: 'userId', operator: '==', value: userId }],
    undefined,
    'desc',
    1
  );
  
  return experts.length > 0 ? experts[0] : null;
};

// Create expert profile
export const createExpertProfile = async (
  id: string,
  data: Omit<Expert, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Expert> => {
  return await createDocumentWithId<Expert>(EXPERTS_COLLECTION, id, data);
};

// Update expert profile
export const updateExpertProfile = async (
  id: string, 
  data: Partial<Expert>
): Promise<void> => {
  await updateDocument<Expert>(EXPERTS_COLLECTION, id, data);
};

// Delete expert profile
export const deleteExpertProfile = async (id: string): Promise<void> => {
  // Delete expertise areas
  const expertiseAreas = await getExpertiseAreasByExpertId(id);
  for (const area of expertiseAreas) {
    await deleteDocument(EXPERTISE_AREAS_COLLECTION, area.id);
  }
  
  // Delete the expert profile
  await deleteDocument(EXPERTS_COLLECTION, id);
};

// Get all experts
export const getAllExperts = async (): Promise<Expert[]> => {
  return await getDocuments<Expert>(EXPERTS_COLLECTION);
};

// Get experts by specialization
export const getExpertsBySpecialization = async (specialization: string): Promise<Expert[]> => {
  return await getDocuments<Expert>(
    EXPERTS_COLLECTION,
    [{ field: 'specialization', operator: 'array-contains', value: specialization }]
  );
};

// Get experts by availability
export const getExpertsByAvailability = async (isAvailable: boolean): Promise<Expert[]> => {
  return await getDocuments<Expert>(
    EXPERTS_COLLECTION,
    [{ field: 'isAvailable', operator: '==', value: isAvailable }]
  );
};

// Get verified experts
export const getVerifiedExperts = async (): Promise<Expert[]> => {
  return await getDocuments<Expert>(
    EXPERTS_COLLECTION,
    [{ field: 'isVerified', operator: '==', value: true }]
  );
};

// Add expertise area
export const addExpertiseArea = async (
  data: Omit<ExpertiseArea, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExpertiseArea> => {
  return await createDocument<ExpertiseArea>(EXPERTISE_AREAS_COLLECTION, data);
};

// Get expertise areas by expert ID
export const getExpertiseAreasByExpertId = async (expertId: string): Promise<ExpertiseArea[]> => {
  return await getDocuments<ExpertiseArea>(
    EXPERTISE_AREAS_COLLECTION,
    [{ field: 'expertId', operator: '==', value: expertId }]
  );
};

// Update expertise area
export const updateExpertiseArea = async (
  id: string, 
  data: Partial<ExpertiseArea>
): Promise<void> => {
  await updateDocument<ExpertiseArea>(EXPERTISE_AREAS_COLLECTION, id, data);
};

// Delete expertise area
export const deleteExpertiseArea = async (id: string): Promise<void> => {
  await deleteDocument(EXPERTISE_AREAS_COLLECTION, id);
};

// Create service assignment
export const createServiceAssignment = async (
  data: Omit<ServiceAssignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceAssignment> => {
  return await createDocument<ServiceAssignment>(SERVICE_ASSIGNMENTS_COLLECTION, data);
};

// Get service assignment by ID
export const getServiceAssignmentById = async (id: string): Promise<ServiceAssignment | null> => {
  return await getDocumentById<ServiceAssignment>(SERVICE_ASSIGNMENTS_COLLECTION, id);
};

// Get service assignment by service request ID
export const getServiceAssignmentByRequestId = async (serviceRequestId: string): Promise<ServiceAssignment | null> => {
  const assignments = await getDocuments<ServiceAssignment>(
    SERVICE_ASSIGNMENTS_COLLECTION,
    [{ field: 'serviceRequestId', operator: '==', value: serviceRequestId }],
    undefined,
    'desc',
    1
  );
  
  return assignments.length > 0 ? assignments[0] : null;
};

// Get service assignments by expert ID
export const getServiceAssignmentsByExpertId = async (
  expertId: string, 
  status?: AssignmentStatus
): Promise<ServiceAssignment[]> => {
  const conditions = [{ field: 'expertId', operator: '==', value: expertId }];
  
  if (status) {
    conditions.push({ field: 'status', operator: '==', value: status });
  }
  
  return await getDocuments<ServiceAssignment>(
    SERVICE_ASSIGNMENTS_COLLECTION,
    conditions,
    'createdAt',
    'desc'
  );
};

// Update service assignment
export const updateServiceAssignment = async (
  id: string, 
  data: Partial<ServiceAssignment>
): Promise<void> => {
  await updateDocument<ServiceAssignment>(SERVICE_ASSIGNMENTS_COLLECTION, id, data);
};

// Add deliverable
export const addDeliverable = async (
  data: Omit<Deliverable, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Deliverable> => {
  return await createDocument<Deliverable>(DELIVERABLES_COLLECTION, data);
};

// Get deliverables by service assignment ID
export const getDeliverablesByAssignmentId = async (assignmentId: string): Promise<Deliverable[]> => {
  return await getDocuments<Deliverable>(
    DELIVERABLES_COLLECTION,
    [{ field: 'serviceAssignmentId', operator: '==', value: assignmentId }],
    'createdAt',
    'desc'
  );
};

// Update deliverable
export const updateDeliverable = async (
  id: string, 
  data: Partial<Deliverable>
): Promise<void> => {
  await updateDocument<Deliverable>(DELIVERABLES_COLLECTION, id, data);
};

// Delete deliverable
export const deleteDeliverable = async (id: string): Promise<void> => {
  // Get the deliverable
  const deliverable = await getDocumentById<Deliverable>(DELIVERABLES_COLLECTION, id);
  
  if (deliverable && deliverable.fileUrl) {
    // Delete the local file
    try {
      await deleteLocalFile(deliverable.fileUrl);
    } catch (error) {
      console.error(`Error deleting local file ${deliverable.fileUrl}:`, error);
    }
  }
  
  // Delete the deliverable record
  await deleteDocument(DELIVERABLES_COLLECTION, id);
}; 