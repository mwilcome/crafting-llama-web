import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface ThreadColor {
    name: string;
    hex: string;
}

@Injectable({ providedIn: 'root' })
export class CustomOrderService {
    private formOpen$ = new BehaviorSubject<boolean>(true);

    constructor(private http: HttpClient) {}

    isFormOpen(): Observable<boolean> {
        return this.formOpen$.asObservable();
    }

    getAvailableThreadColors(): Observable<ThreadColor[]> {
        return of([
            { name: 'Dark Blue', hex: '#001f3f' },
            { name: 'Light Blue', hex: '#7FDBFF' },
            { name: 'Rose Pink', hex: '#FF69B4' },
            { name: 'Lime Green', hex: '#32CD32' },
            { name: 'Sunset Orange', hex: '#FF6347' },
            { name: 'Golden Yellow', hex: '#FFD700' },
        ]);
    }

    submitCustomOrder(payload: Record<string, any>): Observable<{ orderId: string; message?: string; emailSent?: boolean }> {
        // Replace with real endpoint when needed
        console.log('Submitting mock order:', payload);
        return of({
            orderId: 'MOCK123',
            message: 'Thanks! Your order has been placed.',
            emailSent: true
        });
    }
}
