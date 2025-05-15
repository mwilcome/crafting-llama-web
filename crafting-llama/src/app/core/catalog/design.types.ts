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
    readonly name: string;
    readonly label: string;
    readonly type: FieldType;
    readonly required?: boolean;
    readonly options?: string[];
    readonly placeholder?: string;
    readonly defaultValue?: string;
}

export interface Variant {
    readonly id: string;
    readonly name: string;
    readonly priceFrom?: number;
    readonly heroImage?: string;
    readonly fields: FieldDefinition[];
}

export interface Design {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly priceFrom?: number;
    readonly heroImage?: string;
    readonly allowedItems?: string[];
    readonly fields?: FieldDefinition[];
    readonly variants?: Variant[];
}
