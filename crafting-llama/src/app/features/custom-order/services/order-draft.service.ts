import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { OrderDraftEntry } from '@models/order-entry.model';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    private readonly drafts = signal<OrderDraftEntry[]>([]);
    private readonly activeIndex = signal<number>(-1);

    readonly all = this.drafts.asReadonly();
    readonly active = computed(() => this.drafts()[this.activeIndex()] ?? null);

    add(entry: OrderDraftEntry) {
        this.drafts.update(d => [...d, entry]);
        this.activeIndex.set(this.drafts().length - 1);
    }

    edit(index: number) {
        if (index >= 0 && index < this.drafts().length) this.activeIndex.set(index);
    }

    reset(newDrafts: OrderDraftEntry[] = []) {
        this.drafts.set(newDrafts);
        this.activeIndex.set(-1);
    }

}
