import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
    private counter = signal(0);

    readonly isLoading = computed(() => this.counter() > 0);

    show(): void {
        this.counter.update((count) => count + 1);
    }

    hide(): void {
        this.counter.update((count) => Math.max(0, count - 1));
    }
}