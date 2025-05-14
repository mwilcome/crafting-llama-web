export type FieldType =
    | 'text'
    | 'textarea'
    | 'dropdown'
    | 'radio'
    | 'multiselect'
    | 'file'
    | 'color'
    | 'hidden';

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

export interface VariantMeta {
    id: string;
    name: string;
    priceFrom?: number;
    heroImage?: string;
    fields: FieldDefinition[];
}

export interface DesignMeta {
    id: string;
    name: string;
    description?: string;
    priceFrom?: number;
    heroImage?: string;
    allowedItems?: string[];
    fields?: FieldDefinition[];
    variants?: VariantMeta[];
}
