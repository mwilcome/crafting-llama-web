import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DesignMeta } from './design.types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DesignService {
    constructor(private http: HttpClient) {}

    getDesigns(): Observable<DesignMeta[]> {
        return this.http.get<DesignMeta[]>('/assets/placeholder/designs.json');
    }
}
