import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ThreadColor {
    name: string;
    hex: string;
}

export interface FormField {
    label: string;
    name: string;
    type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'file' | 'color' | 'multiselect';
    options?: string[];
    required?: boolean;
    placeholder?: string;
}

export interface CustomFormDefinition {
    productType: string;
    fields: FormField[];
}

@Injectable({
    providedIn: 'root'
})
export class CustomOrderService {
    constructor() {}

    getProductTypes(): Observable<string[]> {
        return of(['bib', 'bag', 'blanket']);
    }

    getAvailableThreadColors(): Observable<ThreadColor[]> {
        return of([
            { name: 'Tiffany Blue', hex: '#0ABAB5' },
            { name: 'Rose Gold', hex: '#B76E79' },
            { name: 'Charcoal', hex: '#333333' },
            { name: 'Snow White', hex: '#FFFFFF' },
            { name: 'Pumpkin Spice', hex: '#C1440E' }
        ]);
    }

    getFormDefinition(type: string): Observable<CustomFormDefinition> {
        const baseFields: Record<string, FormField[]> = {
            bib: [
                { label: "Baby's Name", name: 'name', type: 'text', required: true },
                { label: 'Font Style', name: 'font', type: 'dropdown', options: ['Script', 'Block', 'Fun'], required: true },
                { label: 'Thread Color', name: 'color', type: 'color', required: true },
                { label: 'Theme', name: 'theme', type: 'dropdown', options: ['Seasonal', 'Birthday', 'Religious'] },
                { label: 'Upload Reference', name: 'reference', type: 'file' }
            ],
            bag: [
                { label: 'Name or Monogram', name: 'name', type: 'text', required: true },
                { label: 'Font Style', name: 'font', type: 'dropdown', options: ['Script', 'Block'], required: true },
                { label: 'Embroidery Position', name: 'position', type: 'radio', options: ['Top center', 'Bottom right', 'Center'] },
                { label: 'Optional Designs', name: 'designs', type: 'multiselect', options: ['Flowers', 'Pumpkins', 'Cross'] },
                { label: 'Upload Reference', name: 'reference', type: 'file' }
            ],
            blanket: [
                { label: 'Recipient Name', name: 'name', type: 'text', required: true },
                { label: 'Blanket Size', name: 'size', type: 'dropdown', options: ['Small', 'Medium', 'Large'], required: true },
                { label: 'Theme', name: 'theme', type: 'dropdown', options: ['Floral', 'Seasonal', 'Baby', 'Pet'] },
                { label: 'Embellishment Notes', name: 'notes', type: 'textarea' },
                { label: 'Upload Reference', name: 'reference', type: 'file' }
            ]
        };

        return of({
            productType: type,
            fields: baseFields[type] || []
        });
    }

    isFormOpen(): Observable<boolean> {
        return of(true); // simulate "accepting orders"
    }

    submitCustomOrder(data: any): Observable<any> {
        console.log('Mock submitting order:', data);
        return of({ success: true, message: 'Order received!' });
    }
}
