import { ValidatorFn } from '@angular/forms';

/**
 * Represents a single customizable entry in a user's order.
 */
export interface OrderDraftEntry {
  id: string; // Unique identifier for tracking/edit/editing
  designId: string;
  variantId: string;
  quantity: number;
  fields: FieldDef[];     // Dynamic fields as shown in the form
  formData: Record<string, any>; // Flattened key-value after form submission
  imageUrl?: string;      // Optional image preview
  price?: number;         // Optional price per item
  notes?: string;         // Optional customer notes
  createdAt: Date;
}

/**
 * Defines a single input field in the form builder.
 */
export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'group' | 'hidden';
  required?: boolean;
  default?: any;
  options?: FieldOption[]; // Used only for select/radio
  validators?: ValidatorFn[];
  children?: FieldDef[];   // Used when type === 'group'
  description?: string;    // Optional helper text
  placeholder?: string;    // Optional placeholder for inputs
}

/**
 * Used for radio or select dropdown fields.
 */
export interface FieldOption {
  label: string;
  value: any;
}
