import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

/* mirror the JSON structure we created */
export interface DesignMeta {
    id          : string;
    name        : string;
    priceFrom?  : number;
    heroImage   : string;
    description : string;
    allowedItems: string[];
    fields      : any[];          // reuse existing FormField soon
}

@Injectable({ providedIn: 'root' })
export class DesignService {
    constructor(private http: HttpClient) {}

    /** fetch once and cache for the session */
    getDesigns(): Observable<DesignMeta[]> {
        return this.http
            .get<DesignMeta[]>('/assets/designs.json')
            .pipe(shareReplay(1));
    }
}
