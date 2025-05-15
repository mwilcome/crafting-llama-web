import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class OrderFlowService {
    constructor(private readonly router: Router) {}

    goTo(step: 'select' | 'variant' | 'form' | 'review' | 'summary') {
        this.router.navigate([`/custom/${step}`]);
    }

    reset() {
        // placeholder for now
    }
}
