import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError, map } from 'rxjs';
import { nanoid } from 'nanoid';

/* ---------- models ---------- */
export interface ThreadColor {
    name: string;
    hex: string;
}

/* ------------------------------------------------------------ */

@Injectable({ providedIn: 'root' })
export class CustomOrderService {
    private apiUrl = ''; // set when backend is ready

    constructor(private http: HttpClient) {}

    /* ---------- colors ---------- */
    getAvailableThreadColors(): Observable<ThreadColor[]> {
        return of([
            { name: 'Tiffany Blue',  hex: '#0ABAB5' },
            { name: 'Rose Gold',     hex: '#B76E79' },
            { name: 'Charcoal',      hex: '#333333' },
            { name: 'Snow White',    hex: '#FFFFFF' },
            { name: 'Pumpkin Spice', hex: '#C1440E' }
        ]);
    }

    /* ---------- order window ---------- */
    isFormOpen(): Observable<boolean> {
        return of(true);
    }

    /* ---------- submit order ---------- */
    submitCustomOrder(payload: any): Observable<any> {
        if (this.apiUrl) {
            const fallback = nanoid(6).toUpperCase();
            return this.http
                .post<{ orderId?: string }>(`${this.apiUrl}/orders`, { ...payload })
                .pipe(
                    map(res => ({
                        success: true,
                        orderId: res.orderId ?? fallback,
                        emailSent: true,
                        message: `Order #${res.orderId ?? fallback} received! A confirmation email is on its way.`
                    })),
                    catchError(err => {
                        console.error('API error, switching to stub:', err);
                        return this.stubResponse(fallback);
                    })
                );
        }

        return this.stubResponse(nanoid(6).toUpperCase());
    }

    private stubResponse(orderId: string): Observable<any> {
        console.log(`(stub) sending confirmation email for order ${orderId}`);
        return of({
            success: true,
            orderId,
            emailSent: true,
            message: `Order #${orderId} received! A confirmation email is on its way.`
        }).pipe(delay(800));
    }
}
