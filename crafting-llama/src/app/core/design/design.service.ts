import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FieldDefinition {
    label: string;
    name: string;
    type: 'text' | 'textarea' | 'dropdown' | 'radio' | 'multiselect' | 'file' | 'color';
    options?: string[];
    placeholder?: string;
    required?: boolean;
    sortOrder?: number;
}

export interface VariantMeta {
    id: string;
    name: string;
    priceFrom: number;
    heroImage: string;
    fields: FieldDefinition[];
}

export interface Design {
    id: string;
    name: string;
    description?: string;
    heroImage: string;
    priceFrom: number;
    allowedItems?: string[];
    fields?: FieldDefinition[];
    variants?: VariantMeta[];
}

@Injectable({ providedIn: 'root' })
export class DesignService {
    constructor(private http: HttpClient) {}

    getDesigns(): Observable<Design[]> {
        return this.http.get<Design[]>('/assets/designs.json');
    }
}
