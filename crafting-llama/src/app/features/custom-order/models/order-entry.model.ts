import type { FieldDef } from '@core/catalog/design.types';

export interface OrderDraftEntry {
  id: string;
  createdAt: string;
  designId: string;
  variantId: string;
  quantity: number;
  fields: FieldDef[];
  formData: Record<string, any>;
}
