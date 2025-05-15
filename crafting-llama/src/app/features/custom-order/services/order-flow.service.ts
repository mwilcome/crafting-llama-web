import { Injectable, signal } from '@angular/core';
import { OrderStep } from '@constants/steps';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class OrderFlowService {
    private step = signal<OrderStep>('select');
    readonly currentStep = this.step.asReadonly();

    constructor(private router: Router) {}

    goTo(step: OrderStep) {
        this.step.set(step);
        this.router.navigate(['/custom', step]);
    }

    reset() {
        this.step.set('select');
        this.router.navigate(['/custom/select']);
    }
}
