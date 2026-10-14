import { db } from './data.ts';
import { CasePriority, CaseStatus } from '../src/types/index.ts';

export const VALID_STATUSES: CaseStatus[] = [
  'Draft',
  'Planning',
  'In Review',
  'Approved',
  'Completed',
  'Cancelled',
];

export const VALID_PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High'];

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export function validateCaseInput(data: any, existingCaseId?: number): ValidationResult {
  const errors: Record<string, string[]> = {};

  // case_number: required, unique (ignoring existingCaseId on edit)
  if (!data.case_number || typeof data.case_number !== 'string' || !data.case_number.trim()) {
    errors.case_number = ['The case number field is required.'];
  } else {
    const trimmed = data.case_number.trim();
    if (!/^CASE-\d{4,8}$/i.test(trimmed)) {
      errors.case_number = ['The case number must follow the format CASE-0001.'];
    } else {
      const duplicate = db.getCaseByNumber(trimmed);
      if (duplicate && duplicate.id !== existingCaseId) {
        errors.case_number = ['The case number has already been taken.'];
      }
    }
  }

  // patient_reference: required dummy code, not a real name
  if (!data.patient_reference || typeof data.patient_reference !== 'string' || !data.patient_reference.trim()) {
    errors.patient_reference = ['The patient reference field is required.'];
  } else {
    const ref = data.patient_reference.trim();
    // Validate dummy reference format e.g. PAT-XXXX or alphanumeric code
    if (ref.length < 3) {
      errors.patient_reference = ['The patient reference must be at least 3 characters.'];
    }
  }

  // surgeon_name: required
  if (!data.surgeon_name || typeof data.surgeon_name !== 'string' || !data.surgeon_name.trim()) {
    errors.surgeon_name = ['The surgeon name field is required.'];
  }

  // implant_type: required
  if (!data.implant_type || typeof data.implant_type !== 'string' || !data.implant_type.trim()) {
    errors.implant_type = ['The implant type field is required.'];
  }

  // status: required, must be one of allowed
  if (!data.status) {
    errors.status = ['The status field is required.'];
  } else if (!VALID_STATUSES.includes(data.status)) {
    errors.status = [`The selected status is invalid. Allowed: ${VALID_STATUSES.join(', ')}.`];
  }

  // priority: required, must be one of allowed
  if (!data.priority) {
    errors.priority = ['The priority field is required.'];
  } else if (!VALID_PRIORITIES.includes(data.priority)) {
    errors.priority = [`The selected priority is invalid. Allowed: ${VALID_PRIORITIES.join(', ')}.`];
  }

  // surgery_date: optional, valid date (YYYY-MM-DD)
  if (data.surgery_date !== undefined && data.surgery_date !== null && data.surgery_date !== '') {
    const dateStr = String(data.surgery_date).trim();
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    const parsed = Date.parse(dateStr);
    if (!isValidFormat || isNaN(parsed)) {
      errors.surgery_date = ['The surgery date must be a valid date in YYYY-MM-DD format.'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
