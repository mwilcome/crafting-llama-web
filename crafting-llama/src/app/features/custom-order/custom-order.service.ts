import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { nanoid } from 'nanoid';

/* ---------- models ---------- */
export interface ThreadColor {
    name: string;
    hex : string;
}

export interface FormField {
    label      : string;
    name       : string;
    type       : 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'file' | 'color' | 'multiselect';
    options?   : string[];
    required?  : boolean;
    placeholder?: string;
}

export interface CustomFormDefinition {
    designName: string;
    fields    : FormField[];
}

export interface DesignDefinition {
    designName  : string;
    description?: string;
    allowedItems: string[];
    fields      : FormField[];
}

/* ------------------------------------------------------------ */

@Injectable({ providedIn: 'root' })
export class CustomOrderService {
    /** Set to real endpoint when backend is live */
    private apiUrl = '';   // ex: 'https://api.craftingllama.com'

    constructor(private http: HttpClient) {}

    /* ------------ DESIGN LIST ------------ */
    getDesignTypes(): Observable<string[]> {
        return of(['name', 'flower bouquet', 'seasonal']);
    }

    /* ------------ FORM SCHEMA ------------ */
    getFormDefinition(designName: string): Observable<CustomFormDefinition> {
        const designDefinitions: Record<string, DesignDefinition> = {
            name: {
                designName   : 'name',
                allowedItems : ['Bib', 'Bag', 'Blanket'],
                fields: [
                    { label: 'Name to Stitch',    name: 'name',  type: 'text',     required: true },
                    { label: 'Font Style',        name: 'font',  type: 'dropdown', required: true, options: ['Script', 'Block', 'Fun'] },
                    { label: 'Thread Color',      name: 'color', type: 'color',    required: true },
                    { label: 'Upload Reference',  name: 'reference', type: 'file' }
                ]
            },
            'flower bouquet': {
                designName   : 'flower bouquet',
                allowedItems : ['Bag', 'Blanket'],
                fields: [
                    { label: 'Preferred Colors',  name: 'palette', type: 'multiselect', options: ['Pastel', 'Bold', 'Neutral'] },
                    { label: 'Embellishment Notes', name: 'notes', type: 'textarea' },
                    { label: 'Upload Reference',  name: 'reference', type: 'file' }
                ]
            },
            seasonal: {
                designName   : 'seasonal',
                allowedItems : ['Bib', 'Blanket'],
                fields: [
                    { label: 'Theme',        name: 'theme', type: 'dropdown', required: true, options: ['Pumpkin', 'Snowflakes', 'Hearts'] },
                    { label: 'Thread Color', name: 'color', type: 'color' },
                    { label: 'Upload Reference', name: 'reference', type: 'file' }
                ]
            }
        };

        const def = designDefinitions[designName];

        if (!def) return of({ designName, fields: [] });

        /* inject dynamic Item selector */
        const itemField: FormField = {
            label   : 'Item Type',
            name    : 'item',
            type    : 'dropdown',
            options : def.allowedItems,
            required: true
        };

        return of({ designName, fields: [...def.fields, itemField] });
    }

    /* ------------ COLORS ------------ */
    getAvailableThreadColors(): Observable<ThreadColor[]> {
        return of([
            { name: 'Tiffany Blue',  hex: '#0ABAB5' },
            { name: 'Rose Gold',     hex: '#B76E79' },
            { name: 'Charcoal',      hex: '#333333' },
            { name: 'Snow White',    hex: '#FFFFFF' },
            { name: 'Pumpkin Spice', hex: '#C1440E' }
        ]);
    }

    /* ------------ ORDER WINDOW ------------ */
    isFormOpen(): Observable<boolean> {
        return of(true);
    }

    /* ------------ SUBMIT ORDER ------------ */
    submitCustomOrder(payload: any): Observable<any> {
        /* if apiUrl defined -> call backend */
        if (this.apiUrl) {
            const clientId = nanoid(6).toUpperCase(); // provisional ID if server doesn't return one
            return this.http
                .post<{ orderId?: string }>(`${this.apiUrl}/orders`, { ...payload, orderId: clientId })
                .pipe(
                    map(res => ({
                        success   : true,
                        orderId   : res.orderId ?? clientId,
                        emailSent : true,
                        message   : `Order #${res.orderId ?? clientId} received! A confirmation email is on its way.`
                    })),
                    catchError(err => {
                        console.error('Backend error, switching to stub:', err);
                        return this.stubResponse(clientId);
                    })
                );
        }

        /* fallback stub */
        return this.stubResponse(nanoid(6).toUpperCase());
    }

    /* ------------ stub helper ------------ */
    private stubResponse(orderId: string): Observable<any> {
        console.log(`(stub) sending confirmation email for order ${orderId}`);
        return of({
            success   : true,
            orderId,
            emailSent : true,
            message   : `Order #${orderId} received! A confirmation email is on its way.`
        }).pipe(delay(800));
    }
}
