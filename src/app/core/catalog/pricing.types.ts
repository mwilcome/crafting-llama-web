export interface PricingExampleRaw {
    id: string;
    design_id: string;
    variant_id?: string;
    base_item: string;
    design_fee: number;
    base_cost: number;
    total_estimate: number;
    notes?: string;
}

export interface PricingExample {
    id: string;
    designName: string;
    variantName?: string;
    baseItem: string;
    designFee: number;
    baseCost: number;
    totalEstimate: number;
    notes?: string;
}