export interface FieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'radio' | 'multiselect' | 'color' | 'file';
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

export interface Design {
    id: string;
    name: string;
    description?: string;
    priceFrom?: number;
    heroImage?: string;
    allowedItems?: string[];
    fields?: FieldDefinition[];
    variants?: VariantMeta[];
}
