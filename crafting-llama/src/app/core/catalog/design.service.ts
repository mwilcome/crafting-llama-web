import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Design } from './design.types';
import designsJson from '../../../assets/designs.json';

@Injectable({ providedIn: 'root' })
export class DesignService {
    private config = {
        maxConcurrentOrders: 10,
        currentOpenOrders: 3 // Simulate a full queue by changing this to the max concurrent orders.
    };

    getDesigns(): Observable<Design[]> {
        return of(designsJson as Design[]);
    }

    getAvailableThreadColors(): Observable<{ name: string; hex: string }[]> {
        return of([
            { name: 'Red', hex: '#ff0000' },
            { name: 'Blue', hex: '#0000ff' },
            { name: 'Green', hex: '#00ff00' }
        ]);
    }

    getOrderLimitConfig(): { maxConcurrentOrders: number; currentOpenOrders: number } {
        return this.config;
    }
}
