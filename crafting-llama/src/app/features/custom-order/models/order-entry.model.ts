import { Design, Variant, FieldDef } from '@core/catalog/design.types';

export interface OrderDraftEntry {
  id: string;
  designId: string;
  designName: string;
  variantId: string;
  variantName: string;
  heroImage?: string;
  fields: Record<string, string>;
  quantity: number;
  createdAt: Date;
}

export interface InProgressEntry {
  design: Design;
  variant: Variant;
  fields: FieldDef[];
  values: Record<string, string>;
  quantity: number;
}
