// Types for the database structure
// Based on the provided schema, adapted for Firestore

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  EXPERT = 'EXPERT'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum AssignmentStatus {
  PROPOSED = 'PROPOSED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Timestamp;
  password?: string;
  image?: string;
  role: Role;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Timestamp;
}

export interface Client {
  id: string;
  userId: string;
  phone?: string;
  academicLevel?: string;
  institution?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Expert {
  id: string;
  userId: string;
  bio?: string;
  specialization: string[];
  education?: string;
  hourlyRate?: number;
  isVerified: boolean;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExpertiseArea {
  id: string;
  expertId: string;
  serviceId: string;
  level: number; // 1-5 expertise level
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  serviceId: string;
  subject: string;
  academicLevel: string;
  deadline: Timestamp;
  requirements: string;
  additionalInfo?: string;
  status: RequestStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceAssignment {
  id: string;
  serviceRequestId: string;
  expertId: string;
  proposedPlan?: string;
  startDate?: Timestamp;
  completionDate?: Timestamp;
  status: AssignmentStatus;
  feedback?: string;
  rating?: number; // 1-5 star rating
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Attachment {
  id: string;
  serviceRequestId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string; // User ID
  createdAt: Timestamp;
}

export interface Deliverable {
  id: string;
  serviceAssignmentId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  isApproved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  serviceRequestId: string;
  senderId: string; // User ID
  content: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  serviceRequestId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
  receiptUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 