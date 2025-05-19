export type FieldType =
    | 'text'
    | 'textarea'
    | 'dropdown'
    | 'radio'
    | 'multiselect'
    | 'file'
    | 'color'
    | 'currency'
    | 'imagePreview'
    | 'hidden';

export interface FieldDef {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    defaultValue?: string | number | boolean;
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
