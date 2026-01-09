
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

export type Language = 'en' | 'hi';

export type AgentAction = 
  | 'generateFIR' 
  | 'generateNotice' 
  | 'summarizeCase' 
  | 'analyzeDocument' 
  | 'offenceChecker' 
  | 'dictionaryLookup' 
  | 'timelineInfo'
  | 'rightsInfo'
  | 'generalAnswer';

export interface AgentResponse {
  intent: string;
  confidence: string;
  required_fields: string[];
  response_text: string;
  action: AgentAction;
  data: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  action?: AgentAction;
  isLoading?: boolean;
}

export enum IncidentType {
  ASSAULT = 'Assault / Physical Violence',
  THEFT = 'Theft / Robbery',
  FRAUD = 'Fraud / Financial Crime',
  CYBERCRIME = 'Cybercrime',
  HARASSMENT = 'Harassment / Stalking',
  PROPERTY_DAMAGE = 'Property Damage / Vandalism',
  DOMESTIC_VIOLENCE = 'Domestic Violence',
  CHEQUE_BOUNCE = 'Cheque Bounce',
  OTHER = 'Other',
}

export interface FIRFormData {
  complainant: string;
  accused: string;
  dateTime: string;
  incidentType: IncidentType | '';
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

export interface CommonViewProps {
  language: Language;
  toggleLanguage: () => void;
  onBack?: () => void;
  setView?: (view: View) => void;
}
