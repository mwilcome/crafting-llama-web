import {Design, VariantMeta} from "@core/catalog/design.types";
import {FormGroup} from "@angular/forms";

export interface OrderField {
    name: string;
    type: 'text' | 'textarea' | 'radio' | 'dropdown' | 'file' | 'multiselect';
    label?: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
}

export interface OrderDraftEntry {
    design: Design;
    variant?: VariantMeta;
    form: FormGroup;
    imagePreviews?: Record<string, string>;
}

export interface OrderEntry {
    id: string;
    designId: string;
    designName: string;
    variantId?: string;
    variantName?: string;
    fields: Record<string, any>;
    imagePreviews?: Record<string, string>;
}
