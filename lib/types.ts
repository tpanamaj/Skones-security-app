// User and Authentication Types
export type UserRole = 'admin' | 'accounts' | 'operations' | 'guard';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  lastLogin?: string;
}

// Guard Types
export type GuardStatus = 'on_duty' | 'off_duty' | 'on_leave' | 'sick' | 'suspended';

export interface Guard {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  photo?: string;
  dateOfHire: string;
  status: GuardStatus;
  currentDeploymentPostId?: string;
  meritScore: number;
  certifications: string[];
  lastCheckIn?: string;
  contactEmergency?: string;
}

// Merit Score Types
export interface MeritScore {
  guardId: string;
  overall: number;
  attendance: number;
  performance: number;
  conduct: number;
  trainingCompletion: number;
  lastUpdated: string;
  history: MeritScoreEntry[];
}

export interface MeritScoreEntry {
  date: string;
  category: 'attendance' | 'performance' | 'conduct' | 'training';
  change: number;
  reason: string;
  adjustedBy?: string;
}

// Deployment Post Types
export type PostStatus = 'active' | 'inactive' | 'on_alert' | 'closed';

export interface DeploymentPost {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  status: PostStatus;
  guardsRequired: number;
  assignedGuards: string[];
  shiftStart: string;
  shiftEnd: string;
  createdDate: string;
  lastActivityTime?: string;
}

// Payroll Types
export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface PayrollEntry {
  id: string;
  guardId: string;
  guardName: string;
  period: string;
  daysWorked: number;
  hoursWorked: number;
  hourlyRate: number;
  overtimeHours: number;
  overtimeRate: number;
  deductions: number;
  totalAmount: number;
  status: PaymentStatus;
  approvedBy?: string;
  approvalDate?: string;
  paidDate?: string;
  notes?: string;
}

export interface PayrollPeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'processing';
  totalGuards: number;
  totalAmount: number;
  processedCount: number;
}

// Incident Types
export type IncidentType = 'theft' | 'breach' | 'injury' | 'equipment_damage' | 'unauthorized_access' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  reportedBy: string;
  guardIds: string[];
  severity: IncidentSeverity;
  status: IncidentStatus;
  photos: string[];
  attachments: string[];
  timeline: IncidentUpdate[];
  resolutionNotes?: string;
  resolvedDate?: string;
}

export interface IncidentUpdate {
  timestamp: string;
  updatedBy: string;
  status: IncidentStatus;
  notes: string;
}

// Geo-Tracking Types
export interface GuardLocation {
  guardId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
}

export interface LocationHistory {
  guardId: string;
  locations: GuardLocation[];
  startDate: string;
  endDate: string;
}

// Communication Types
export interface Contact {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientIds?: string[];
  content: string;
  timestamp: string;
  read: boolean;
  readAt?: string;
  attachments?: string[];
  type: 'direct' | 'broadcast' | 'group';
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  messages: Message[];
  lastMessage?: Message;
  lastMessageTime?: string;
}

// Company Info Types
export interface BoardMember {
  id: string;
  name: string;
  title: string;
  photo: string;
  bio: string;
  email?: string;
  phone?: string;
}

export interface CompanyInfo {
  name: string;
  foundedYear: number;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  headquarters: {
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    whatsapp?: string;
  };
  services: Service[];
  boardMembers: BoardMember[];
  history: HistoryMilestone[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface HistoryMilestone {
  year: number;
  title: string;
  description: string;
}

// Dashboard Types
export interface DashboardStats {
  totalGuards: number;
  guardsOnDuty: number;
  pendingIncidents: number;
  payrollDue: number;
  deploymentsActive: number;
}

export interface DashboardActivity {
  id: string;
  type: 'guard_check_in' | 'incident_reported' | 'payroll_processed' | 'deployment_created';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}
