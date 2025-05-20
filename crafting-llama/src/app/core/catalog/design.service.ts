import { Injectable, computed, signal } from '@angular/core';
import { Design } from '@core/catalog/design.types';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Injectable({ providedIn: 'root' })
export class DesignService {
    private readonly _designs = signal<Design[]>([]);

    constructor() {
        // Simulate fetching from API
        this._designs.set(MOCK_DESIGNS);
    }

    readonly designs = computed(() => this._designs());
}
