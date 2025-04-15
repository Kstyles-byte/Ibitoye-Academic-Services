import { 
  getDocumentById, 
  getDocuments, 
  createDocument,
  updateDocument, 
  deleteDocument 
} from '../firestore';
import { ServiceRequest, RequestStatus, Attachment, Message } from '../types';
import { deleteLocalFile } from '../../cloudinary';

const SERVICE_REQUESTS_COLLECTION = 'serviceRequests';
const ATTACHMENTS_COLLECTION = 'attachments';
const MESSAGES_COLLECTION = 'messages';

// Get service request by ID
export const getServiceRequestById = async (id: string): Promise<ServiceRequest | null> => {
  return await getDocumentById<ServiceRequest>(SERVICE_REQUESTS_COLLECTION, id);
};

// Get service requests by client ID
export const getServiceRequestsByClientId = async (clientId: string): Promise<ServiceRequest[]> => {
  return await getDocuments<ServiceRequest>(
    SERVICE_REQUESTS_COLLECTION,
    [{ field: 'clientId', operator: '==', value: clientId }],
    'createdAt',
    'desc'
  );
};

// Get service requests by status
export const getServiceRequestsByStatus = async (status: RequestStatus): Promise<ServiceRequest[]> => {
  return await getDocuments<ServiceRequest>(
    SERVICE_REQUESTS_COLLECTION,
    [{ field: 'status', operator: '==', value: status }],
    'createdAt',
    'desc'
  );
};

// Create service request
export const createServiceRequest = async (
  data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceRequest> => {
  return await createDocument<ServiceRequest>(SERVICE_REQUESTS_COLLECTION, data);
};

// Update service request
export const updateServiceRequest = async (
  id: string, 
  data: Partial<ServiceRequest>
): Promise<void> => {
  await updateDocument<ServiceRequest>(SERVICE_REQUESTS_COLLECTION, id, data);
};

// Delete service request
export const deleteServiceRequest = async (id: string): Promise<void> => {
  // Delete attachments related to this request
  const attachments = await getAttachmentsByServiceRequestId(id);
  for (const attachment of attachments) {
    // Delete the local file
    try {
      await deleteLocalFile(attachment.fileUrl);
    } catch (error) {
      console.error(`Error deleting local file ${attachment.fileUrl}:`, error);
    }
    // Delete the attachment record
    await deleteDocument(ATTACHMENTS_COLLECTION, attachment.id);
  }
  
  // Delete messages related to this request
  const messages = await getMessagesByServiceRequestId(id);
  for (const message of messages) {
    await deleteDocument(MESSAGES_COLLECTION, message.id);
  }
  
  // Delete the service request
  await deleteDocument(SERVICE_REQUESTS_COLLECTION, id);
};

// Get all service requests
export const getAllServiceRequests = async (): Promise<ServiceRequest[]> => {
  return await getDocuments<ServiceRequest>(SERVICE_REQUESTS_COLLECTION, [], 'createdAt', 'desc');
};

// Add attachment to service request
export const addAttachment = async (
  data: Omit<Attachment, 'id' | 'createdAt'>
): Promise<Attachment> => {
  return await createDocument<Attachment>(ATTACHMENTS_COLLECTION, data);
};

// Get attachments by service request ID
export const getAttachmentsByServiceRequestId = async (serviceRequestId: string): Promise<Attachment[]> => {
  console.log(`Fetching attachments for service request: ${serviceRequestId}`);
  try {
    const attachments = await getDocuments<Attachment>(
      ATTACHMENTS_COLLECTION,
      [{ field: 'serviceRequestId', operator: '==', value: serviceRequestId }],
      'createdAt',
      'desc'
    );
    
    console.log(`Found ${attachments.length} attachments for service request: ${serviceRequestId}`);
    
    // Ensure all attachments have valid URLs
    return attachments.filter(attachment => {
      if (!attachment.fileUrl) {
        console.warn(`Attachment ${attachment.id} has no fileUrl`);
        return false;
      }
      return true;
    });
  } catch (error) {
    console.error(`Error fetching attachments for service request ${serviceRequestId}:`, error);
    return [];
  }
};

// Delete an attachment
export const deleteAttachment = async (id: string): Promise<void> => {
  // Get the attachment
  const attachment = await getDocumentById<Attachment>(ATTACHMENTS_COLLECTION, id);
  
  if (attachment) {
    // Delete the local file
    try {
      await deleteLocalFile(attachment.fileUrl);
    } catch (error) {
      console.error(`Error deleting local file ${attachment.fileUrl}:`, error);
    }
  }
  
  // Delete the attachment record
  await deleteDocument(ATTACHMENTS_COLLECTION, id);
};

// Add message to service request
export const addMessage = async (
  data: Omit<Message, 'id' | 'createdAt'>
): Promise<Message> => {
  return await createDocument<Message>(MESSAGES_COLLECTION, data);
};

// Get messages by service request ID
export const getMessagesByServiceRequestId = async (serviceRequestId: string): Promise<Message[]> => {
  return await getDocuments<Message>(
    MESSAGES_COLLECTION,
    [{ field: 'serviceRequestId', operator: '==', value: serviceRequestId }],
    'createdAt',
    'asc'
  );
};

// Mark message as read
export const markMessageAsRead = async (id: string): Promise<void> => {
  await updateDocument<Message>(MESSAGES_COLLECTION, id, { isRead: true });
};

// Get unread messages count for a service request
export const getUnreadMessagesCount = async (
  serviceRequestId: string,
  userId: string
): Promise<number> => {
  const messages = await getDocuments<Message>(
    MESSAGES_COLLECTION,
    [
      { field: 'serviceRequestId', operator: '==', value: serviceRequestId },
      { field: 'senderId', operator: '!=', value: userId },
      { field: 'isRead', operator: '==', value: false }
    ]
  );
  
  return messages.length;
}; 