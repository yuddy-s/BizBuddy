
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND'
}

export enum TransactionSource {
  STRIPE = 'STRIPE',
  MANUAL = 'MANUAL'
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'Labor' | 'Parts' | 'Service' | 'Other';
  total: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: string | null;
  dueAt: string;
  paidAt: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  pdfUrl?: string;
  stripePaymentLinkUrl?: string;
  lineItems: LineItem[];
}

export interface Transaction {
  id: string;
  organizationId: string;
  invoiceId?: string;
  type: TransactionType;
  amount: number;
  source: TransactionSource;
  description: string;
  transactedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  stripeAccountId?: string;
  taxRate: number;
}

// --- Communications & Marketing Types ---

export enum CommType {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export enum CommCategory {
  REMINDER = 'REMINDER',
  MARKETING = 'MARKETING',
  TRANSACTIONAL = 'TRANSACTIONAL'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED'
}

export interface CommunicationTemplate {
  id: string;
  organizationId: string;
  name: string;
  type: CommType;
  category: CommCategory;
  subject?: string;
  body: string;
  variables?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ServiceReminder {
  id: string;
  organizationId: string;
  customerId: string | null; // null for default reminders
  serviceType: string;
  intervalMonths: number;
  intervalMiles?: number;
  reminderDays: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface Campaign {
  id: string;
  organizationId: string;
  templateId?: string;
  name: string;
  type: CommType;
  status: CampaignStatus;
  subject?: string;
  body: string;
  targetSegment?: any;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  stats?: {
    opened: number;
    clicked: number;
    delivered: number;
  };
}

export interface CommunicationLog {
  id: string;
  organizationId: string;
  customerId: string;
  type: CommType;
  channel: 'CAMPAIGN' | 'REMINDER' | 'MANUAL';
  subject?: string;
  body: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt: string;
}
