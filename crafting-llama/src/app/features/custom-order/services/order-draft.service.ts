import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import {OrderDraftEntry} from "@core/catalog/design.types";

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    private drafts = signal<OrderDraftEntry[]>([]);
    private selectedId = signal<string | null>(null);

    entries = computed(() => this.drafts());
    currentEntry = computed(() => this.entries().find(e => e.id === this.selectedId()));

    select(id: string) {
        this.selectedId.set(id);
    }

    addEntry(entry: OrderDraftEntry) {
        this.drafts.update(list => [...list, entry]);
        this.select(entry.id);
    }

    updateEntry(id: string, patch: Partial<OrderDraftEntry>) {
        this.drafts.update(list =>
            list.map(e => e.id === id ? { ...e, ...patch } : e)
        );
    }

    removeEntry(id: string) {
        this.drafts.update(list => list.filter(e => e.id !== id));
        if (this.selectedId() === id) this.selectedId.set(null);
    }

    resetAll() {
        this.drafts.set([]);
        this.selectedId.set(null);
    }
}
