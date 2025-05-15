export type FieldType =
    | 'text'
    | 'textarea'
    | 'dropdown'
    | 'radio'
    | 'multiselect'
    | 'file'
    | 'color'
    | 'hidden'
    | 'number'
    | 'image';

export interface FieldDef {
    key: string;
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    defaultValue?: string;
    options?: { label: string; value: string }[];
}

export interface Variant {
    id: string;
    name: string;
    price: number;
    heroImage: string;
    fields: FieldDef[];
}

export interface Design {
    id: string;
    name: string;
    description: string;
    variants: Variant[];
    heroImage: string;
}
