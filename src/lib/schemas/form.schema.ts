import { z } from "zod";

// ============================================
// FIELD TYPE SCHEMA
// ============================================

export const FieldTypeSchema = z.enum([
  "text",
  "email",
  "number",
  "date",
  "textarea",
  "select",
  "checkbox",
  "file",
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

// ============================================
// FORM FIELD SCHEMA
// ============================================

export const FormFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export type FormFieldOption = z.infer<typeof FormFieldOptionSchema>;

export const FormFieldValidationRuleSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  message: z.string().optional(),
});

export type FormFieldValidationRule = z.infer<
  typeof FormFieldValidationRuleSchema
>;

export const CreateFormFieldSchema = z.object({
  fieldName: z
    .string()
    .min(1, "Field name is required")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid field name format"),
  fieldLabel: z.string().min(1, "Field label is required"),
  fieldType: FieldTypeSchema,
  fieldOrder: z.number().int().min(0),
  isRequired: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  defaultValue: z.string().optional().nullable(),
  validationRule: FormFieldValidationRuleSchema.optional().nullable(),
  options: z.array(FormFieldOptionSchema).optional().nullable(),
  columnWidth: z.enum(["full", "half", "third"]).default("full"),
});

export type CreateFormField = z.infer<typeof CreateFormFieldSchema>;

export const FormFieldSchema = CreateFormFieldSchema.extend({
  id: z.string(),
  formId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

// ============================================
// FORM FIELD SCHEMA WITH JSON PARSING
// ============================================
// This schema is used for database responses where validationRule and options are stored as JSON strings

export const FormFieldWithParsedDataSchema = FormFieldSchema.transform((field) => ({
  ...field,
  validationRule:
    typeof field.validationRule === "string" && field.validationRule
      ? (() => {
          try {
            return JSON.parse(field.validationRule);
          } catch {
            return null;
          }
        })()
      : field.validationRule,
  options:
    typeof field.options === "string" && field.options
      ? (() => {
          try {
            return JSON.parse(field.options);
          } catch {
            return [];
          }
        })()
      : field.options,
}));

export type FormFieldWithParsedData = z.infer<typeof FormFieldWithParsedDataSchema>;

// ============================================
// FORM SCHEMA
// ============================================

export const CreateFormSchema = z.object({
  name: z
    .string()
    .min(3, "Form name must be at least 3 characters")
    .max(255, "Form name must be less than 255 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  formType: z
    .string()
    .min(1, "Form type is required")
    .max(100, "Form type must be less than 100 characters"),
  version: z.number().int().min(1).default(1),
  fields: z.array(CreateFormFieldSchema).min(1, "At least one field required"),
});

export type CreateForm = z.infer<typeof CreateFormSchema>;

export const UpdateFormSchema = z.object({
  name: z
    .string()
    .min(3, "Form name must be at least 3 characters")
    .optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  fields: z.array(CreateFormFieldSchema).optional(),
});

export type UpdateForm = z.infer<typeof UpdateFormSchema>;

export const FormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  formType: z.string(),
  version: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  fields: z.array(FormFieldSchema),
});

export type Form = z.infer<typeof FormSchema>;

// ============================================
// FORM SCHEMA WITH PARSED FIELDS
// ============================================
// Use this when retrieving forms from the database

export const FormWithParsedFieldsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  formType: z.string(),
  version: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  fields: z.array(FormFieldWithParsedDataSchema),
});

export type FormWithParsedFields = z.infer<typeof FormWithParsedFieldsSchema>;

// ============================================
// FORM SUBMISSION SCHEMA
// ============================================

export const SubmissionStatusSchema = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
]);

export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const CreateFormSubmissionSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  status: SubmissionStatusSchema.default("submitted"),
  memberComputerId: z
    .union([z.string(), z.number(), z.bigint()])
    .optional()
    .nullable(),
  fieldValues: z.record(z.string(), z.any()),
  submittedBy: z.string().email().optional(),
});

export type CreateFormSubmission = z.infer<typeof CreateFormSubmissionSchema>;

export const UpdateFormSubmissionSchema = z.object({
  status: SubmissionStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  approvedBy: z.string().optional(),
  fieldValues: z.record(z.string(), z.any()).optional(),
});

export type UpdateFormSubmission = z.infer<typeof UpdateFormSubmissionSchema>;

export const FormFieldValueSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  fieldId: z.string(),
  value: z.string().nullable(),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  field: FormFieldWithParsedDataSchema.optional(),
});

export type FormFieldValue = z.infer<typeof FormFieldValueSchema>;

export const FormSubmissionSchema = z.object({
  id: z.string(),
  formId: z.string(),
  memberComputerId: z.bigint().nullable(),
  submissionDate: z.date(),
  status: SubmissionStatusSchema,
  submittedBy: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedDate: z.date().nullable(),
  notes: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  form: FormWithParsedFieldsSchema.optional(),
  fieldValues: z.array(FormFieldValueSchema).optional(),
});

export type FormSubmission = z.infer<typeof FormSubmissionSchema>;

// ============================================
// AUDIT LOG SCHEMA
// ============================================

export const AuditActionSchema = z.enum([
  "created",
  "created_draft",
  "updated",
  "submitted",
  "approved",
  "rejected",
  "deleted",
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export const FormAuditLogSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  action: AuditActionSchema,
  changedBy: z.string(),
  changes: z.string().nullable().optional(),
  timestamp: z.date(),
  ipAddress: z.string().nullable().optional(),
});

export type FormAuditLog = z.infer<typeof FormAuditLogSchema>;

// ============================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const ApiResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(schema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
  });

// ============================================
// SPECIFIC API RESPONSE SCHEMAS
// ============================================

export const CreateFormResponseSchema = ApiResponseSchema(FormWithParsedFieldsSchema);
export const GetFormsResponseSchema = PaginatedResponseSchema(FormWithParsedFieldsSchema);
export const GetFormResponseSchema = ApiResponseSchema(FormWithParsedFieldsSchema);

export const CreateSubmissionResponseSchema = ApiResponseSchema(
  FormSubmissionSchema
);
export const GetSubmissionsResponseSchema = PaginatedResponseSchema(
  FormSubmissionSchema
);
export const GetSubmissionResponseSchema = ApiResponseSchema(
  FormSubmissionSchema
);

// ============================================
// EXPORT ALL SCHEMAS
// ============================================

export const Schemas = {
  // Field Types
  FieldType: FieldTypeSchema,
  FormFieldOption: FormFieldOptionSchema,
  FormFieldValidationRule: FormFieldValidationRuleSchema,

  // Forms
  CreateFormField: CreateFormFieldSchema,
  FormField: FormFieldSchema,
  FormFieldWithParsedData: FormFieldWithParsedDataSchema,
  CreateForm: CreateFormSchema,
  UpdateForm: UpdateFormSchema,
  Form: FormSchema,
  FormWithParsedFields: FormWithParsedFieldsSchema,

  // Submissions
  SubmissionStatus: SubmissionStatusSchema,
  CreateFormSubmission: CreateFormSubmissionSchema,
  UpdateFormSubmission: UpdateFormSubmissionSchema,
  FormFieldValue: FormFieldValueSchema,
  FormSubmission: FormSubmissionSchema,

  // Audit
  AuditAction: AuditActionSchema,
  FormAuditLog: FormAuditLogSchema,

  // API
  Pagination: PaginationSchema,
  ApiResponse: ApiResponseSchema,
  PaginatedResponse: PaginatedResponseSchema,

  // API Responses
  CreateFormResponse: CreateFormResponseSchema,
  GetFormsResponse: GetFormsResponseSchema,
  GetFormResponse: GetFormResponseSchema,
  CreateSubmissionResponse: CreateSubmissionResponseSchema,
  GetSubmissionsResponse: GetSubmissionsResponseSchema,
  GetSubmissionResponse: GetSubmissionResponseSchema,
};