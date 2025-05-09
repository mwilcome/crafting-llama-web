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
    designName: string;
    fields: FormField[];
}

export interface DesignDefinition {
    designName: string;
    description?: string;
    allowedItems: string[];
    fields: FormField[];
}


@Injectable({
    providedIn: 'root'
})
export class CustomOrderService {
    constructor() {}

    getDesignTypes(): Observable<string[]> {
        return of(['name', 'flower bouquet', 'seasonal']);
    }

    getFormDefinition(designName: string): Observable<CustomFormDefinition> {
        const designDefinitions: Record<string, DesignDefinition> = {
            name: {
                designName: 'name',
                allowedItems: ['Bib', 'Bag', 'Blanket'],
                fields: [
                    { label: 'Name to Stitch', name: 'name', type: 'text', required: true },
                    { label: 'Font Style', name: 'font', type: 'dropdown', options: ['Script', 'Block', 'Fun'], required: true },
                    { label: 'Thread Color', name: 'color', type: 'color', required: true },
                    { label: 'Upload Reference', name: 'reference', type: 'file' }
                ]
            },
            'flower bouquet': {
                designName: 'flower bouquet',
                allowedItems: ['Bag', 'Blanket'],
                fields: [
                    { label: 'Preferred Colors', name: 'palette', type: 'multiselect', options: ['Pastel', 'Bold', 'Neutral'] },
                    { label: 'Embellishment Notes', name: 'notes', type: 'textarea' },
                    { label: 'Upload Reference', name: 'reference', type: 'file' }
                ]
            },
            seasonal: {
                designName: 'seasonal',
                allowedItems: ['Bib', 'Blanket'],
                fields: [
                    { label: 'Theme', name: 'theme', type: 'dropdown', options: ['Pumpkin', 'Snowflakes', 'Hearts'], required: true },
                    { label: 'Thread Color', name: 'color', type: 'color' },
                    { label: 'Upload Reference', name: 'reference', type: 'file' }
                ]
            }
        };

        const def = designDefinitions[designName];

        if (!def) {
            return of({ designName, fields: [] });
        }

        const itemField: FormField = {
            label: 'Item Type',
            name: 'item',
            type: 'dropdown',
            options: def.allowedItems,
            required: true
        };

        return of({
            designName,
            fields: [...def.fields, itemField]
        });
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

    isFormOpen(): Observable<boolean> {
        return of(true);
    }

    submitCustomOrder(data: any): Observable<any> {
        console.log('Mock submitting order:', data);
        return of({ success: true, message: 'Order received!' });
    }

}
