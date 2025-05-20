export interface Order {
    id: string;
    createdAt: Date;
    entries: OrderDraftEntry[];
}

export interface OrderDraftEntry {
    id: string;
    designId: string;
    variantId?: string;
    quantity: number;
    values: Record<string, string | File>;
    createdAt: Date;
}

export interface Design {
    id: string;
    name: string;
    description: string;
    priceFrom: number;
    heroImage: string;
    fields: FieldDef[];
    variants?: Variant[];
}

export interface Variant {
    id: string;
    name: string;
    price: number;
    heroImage: string;
    fields?: FieldDef[];
}

export interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'dropdown' | 'radio' | 'file' | 'hidden' | 'color';
    required?: boolean;
    defaultValue?: string;
    placeholder?: string;
    options?: { label: string; value: string }[];
}