export interface IFormField {
  id: string;
  formId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldOrder: number;
  isRequired: boolean;
  isHidden: boolean;
  placeholder: string | null;
  helpText: string | null;
  defaultValue: string | null;
  validationRule: string | null;
  options: string | null;
  columnWidth: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForm {
  id: string;
  name: string;
  description: string;
  formType: string;
  version: number;
  isActive: boolean;
  fields: IFormField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IFormSubmission {
  id: string;
  formId: string;
  memberComputerId: bigint | null;
  submissionDate: Date;
  status: string;
  submittedBy: string | null;
  approvedBy: string | null;
  approvedDate: Date | null;
  notes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
