import { Prisma } from '@prisma/client';

// Zakat Application Types
export type ZakatApplicationFormData = {
  // Basic Information
  applicantName: string;
  fatherOrHusbandName: string;
  identification: string;
  membershipNumber?: string;
  idCardNumber: string;
  dateOfBirth: Date;
  education: string;
  
  // Contact Information
  currentAddress: string;
  mobileNumber: string;
  applicationDate: Date;
  lastApplicationDate?: Date;
  
  // Professional Information
  professionOrSkill: string;
  workingInstitution?: string;
  institutionContact?: string;
  institutionAddress?: string;
  
  // Marital Status
  maritalStatus: 'married' | 'unmarried' | 'widow' | 'divorced';
  
  // Residential Details
  residentialStatus: 'owned' | 'rented' | 'lease';
  
  // Household Information
  parentsLivingWithYou: boolean;
  numberOfBrothers?: number;
  numberOfChildren?: number;
  totalFamilyMembers?: number;
  totalEarningMembers?: number;
  monthlyIncome?: number;
  
  // Assets Information (Yes/No questions with details)
  hasGold: boolean;
  goldDetails?: string;
  goldAmount?: number;
  
  hasSilver: boolean;
  silverDetails?: string;
  silverAmount?: number;
  
  hasCash: boolean;
  cashDetails?: string;
  cashAmount?: number;
  
  hasPrizeBonds: boolean;
  prizeBondsDetails?: string;
  prizeBondsAmount?: number;
  
  hasExcessItems: boolean;
  excessItemsDetails?: string;
  
  hasBusiness: boolean;
  businessDetails?: string;
  businessCapital?: number;
  
  hasGivenLoan: boolean;
  givenLoanDetails?: string;
  givenLoanAmount?: number;
  loanForgivenAmount?: number;
  
  hasCommittee: boolean;
  committeeDetails?: string;
  committeeAmountReceived?: number;
  
  hasTakenLoan: boolean;
  takenLoanDetails?: string;
  takenLoanAmount?: number;
  loanForgivenByCreditor?: boolean;
  
  hasInvestment: boolean;
  investmentDetails?: string;
  
  // Affidavit and Declaration
  declarationAccepted: boolean;
  
  // Status fields
  status?: 'pending' | 'approved' | 'rejected';
  approvedAmount?: number;
  remarks?: string;
};

export type ZakatApplication = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
} & ZakatApplicationFormData;

// Business Loan Application Types
export type BusinessLoanFormData = {
  // Basic Information
  applicantName: string;
  fatherOrHusbandName: string;
  identification: string;
  membershipNumber?: string;
  idCardNumber: string;
  dateOfBirth: Date;
  education: string;
  
  // Contact Information
  currentAddress: string;
  mobileNumber: string;
  applicationDate: Date;
  
  // Professional Information
  professionOrSkill: string;
  workingInstitution?: string;
  institutionContact?: string;
  institutionAddress?: string;
  
  // Business Information
  businessType: string;
  businessDescription: string;
  loanAmount: number;
  loanPurpose: string;
  expectedMonthlyProfit?: number;
  repaymentPeriod?: number; // in months
  
  // Guarantor Information
  guarantor1Name: string;
  guarantor1CNIC: string;
  guarantor1Contact: string;
  guarantor1Relation: string;
  
  guarantor2Name?: string;
  guarantor2CNIC?: string;
  guarantor2Contact?: string;
  guarantor2Relation?: string;
  
  // Financial Information
  monthlyIncome?: number;
  monthlyExpenses?: number;
  existingLoans?: number;
  
  // Status fields
  status?: 'pending' | 'approved' | 'rejected' | 'disbursed';
  approvedAmount?: number;
  disbursedAmount?: number;
  disbursementDate?: Date;
  remarks?: string;
};

export type BusinessLoanApplication = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
} & BusinessLoanFormData;

// Welfare Application Types
export type WelfareApplicationFormData = {
  // Basic Information
  applicantName: string;
  fatherOrHusbandName: string;
  identification: string;
  membershipNumber?: string;
  idCardNumber: string;
  dateOfBirth: Date;
  education: string;
  
  // Contact Information
  currentAddress: string;
  mobileNumber: string;
  applicationDate: Date;
  
  // Professional Information
  professionOrSkill: string;
  workingInstitution?: string;
  
  // Marital Status
  maritalStatus: 'married' | 'unmarried' | 'widow' | 'divorced';
  
  // Household Information
  numberOfChildren?: number;
  totalFamilyMembers?: number;
  totalEarningMembers?: number;
  monthlyIncome?: number;
  
  // Assistance Required
  assistanceType: 'medical' | 'education' | 'marriage' | 'housing' | 'monthly_help' | 'emergency' | 'other';
  assistanceDescription: string;
  estimatedAmount: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Medical Information (if applicable)
  patientName?: string;
  patientRelation?: string;
  medicalCondition?: string;
  hospitalName?: string;
  doctorName?: string;
  estimatedMedicalCost?: number;
  
  // Education Information (if applicable)
  studentName?: string;
  studentRelation?: string;
  institutionName?: string;
  courseOrClass?: string;
  feeAmount?: number;
  
  // Supporting Documents
  hasDocuments: boolean;
  documentsList?: string;
  
  // Status fields
  status?: 'pending' | 'approved' | 'rejected' | 'disbursed';
  approvedAmount?: number;
  disbursedAmount?: number;
  disbursementDate?: Date;
  remarks?: string;
};

export type WelfareApplication = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
} & WelfareApplicationFormData;

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Form Action Response
export type FormActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};