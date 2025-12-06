export enum View {
  HOME = 'HOME',
  CHAT = 'CHAT',
  LAW_FINDER = 'LAW_FINDER',
  DOCUMENT_ANALYZER = 'DOCUMENT_ANALYZER',
  FIR_GENERATOR = 'FIR_GENERATOR',
  NOTICE_GENERATOR = 'NOTICE_GENERATOR',
  CASE_SUMMARY = 'CASE_SUMMARY',
  TIMELINE = 'TIMELINE',
  RIGHTS = 'RIGHTS',
  DICTIONARY = 'DICTIONARY',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface FIRFormData {
  complainant: string;
  accused: string;
  dateTime: string;
  incidentDetails: string;
  evidence: string;
}

export enum NoticeType {
  MONEY_RECOVERY = 'Money Recovery',
  PROPERTY_DISPUTE = 'Property Dispute',
  CHEQUE_BOUNCE = 'Cheque Bounce',
  HARASSMENT = 'Harassment/Threat',
  CONSUMER = 'Consumer Complaint',
  DEFAMATION = 'Defamation',
  LOAN_RECOVERY = 'Loan Recovery Misuse',
}
