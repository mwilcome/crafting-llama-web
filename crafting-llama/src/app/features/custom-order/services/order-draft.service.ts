import {effect, Injectable} from '@angular/core';
import { signal, computed } from '@angular/core';
import { OrderDraftEntry } from '@models/order-entry.model';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    private readonly STORAGE_KEY = 'custom-order-drafts';

    private drafts = signal<OrderDraftEntry[]>(this.restoreDrafts());
    private activeIndex = signal<number>(-1);

    readonly all = this.drafts.asReadonly();
    readonly active = computed(() => this.drafts()[this.activeIndex()] ?? null);

    constructor() {
        effect(() => {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.drafts()));
        });
    }

    private restoreDrafts(): OrderDraftEntry[] {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    add(draft: OrderDraftEntry) {
        this.drafts.update(d => [...d, draft]);
        this.activeIndex.set(this.drafts().length - 1);
    }

    edit(index: number) {
        if (index >= 0 && index < this.drafts().length) {
            this.activeIndex.set(index);
        }
    }

    reset(next: OrderDraftEntry[] = []) {
        this.drafts.set(next);
        this.activeIndex.set(-1);
    }
}
