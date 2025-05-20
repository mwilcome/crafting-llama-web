import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderFlowService {
    private step = signal<'select' | 'variant' | 'form' | 'review' | 'summary'>('select');
    readonly currentStep = computed(() => this.step());

    goTo(step: 'select' | 'variant' | 'form' | 'review' | 'summary') {
        this.step.set(step);
    }
}
