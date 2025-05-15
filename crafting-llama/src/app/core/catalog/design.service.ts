import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Design } from './design.types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DesignService {
    constructor(private http: HttpClient) {}

    getDesigns(): Observable<Design[]> {
        return this.http.get<Design[]>('/assets/placeholder/designs.json');
    }
}
