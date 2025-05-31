import { Injectable, signal, computed, effect } from '@angular/core';
import { Design, Variant } from '@core/catalog/design.types';

export type Step = 'select' | 'variant' | 'form' | 'review' | 'summary';

@Injectable({ providedIn: 'root' })
export class OrderFlowService {
    private step = signal<Step>('select');
    readonly currentStep = computed(() => this.step());

    private design = signal<Design | null>(this.hydrate('llama.selectedDesign'));
    private variant = signal<Variant | null>(this.hydrate('llama.selectedVariant'));
    private showMore = signal<boolean>(this.hydrate('llama.showMore') ?? false);

    readonly selectedDesign = computed(() => this.design());
    readonly selectedVariant = computed(() => this.variant());
    readonly showMoreOptions = computed(() => this.showMore());

    constructor() {
        effect(() => {
            localStorage.setItem('llama.selectedDesign', JSON.stringify(this.design()));
            localStorage.setItem('llama.selectedVariant', JSON.stringify(this.variant()));
            localStorage.setItem('llama.showMore', JSON.stringify(this.showMore()));
        });
    }

    goTo(step: Step) {
        this.step.set(step);
    }

    selectDesign(d: Design) {
        this.design.set(d);
        this.variant.set(null);
    }

    selectVariant(v: Variant) {
        this.variant.set(v);
    }

    toggleShowMore() {
        this.showMore.update(v => !v);
    }

    private hydrate<T>(key: string): T | null {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }
}
