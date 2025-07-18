export interface BaseProductCategory {
    id: string;
    name: string;
    description?: string;
    /** Short blurb shown under the main description */
    sub_description?: string;
    image_url?: string;
    sort_order?: number;
    created_at: string;
    updated_at: string;
}

export interface BaseProduct {
    id: string;
    category_id: string;
    type: string;
    /** Main marketing copy */
    description?: string;
    /** Secondary blurb shown in the details panel */
    sub_description?: string;
    /** Optional tertiary blurb for future UX ideas */
    extra_description?: string;
    image_url?: string;
    price_min: number;
    price_max: number;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface BaseProductSize {
    id: string;
    base_product_id: string;
    label: string;
    price_override?: number;
    created_at: string;
    updated_at: string;
}
