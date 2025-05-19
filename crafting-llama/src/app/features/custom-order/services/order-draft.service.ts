import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { OrderDraftEntry } from '@models/order-entry.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    private readonly drafts = signal<OrderDraftEntry[]>([]);

    readonly allDrafts = computed(() => this.drafts());

    addEntry(entry: Omit<OrderDraftEntry, 'id' | 'createdAt'>) {
        const newEntry: OrderDraftEntry = {
            ...entry,
            id: uuidv4(),
            createdAt: new Date()
        };
        this.drafts.update(d => [...d, newEntry]);
    }

    deleteEntry(id: string) {
        this.drafts.update(d => d.filter(entry => entry.id !== id));
    }

    getEntryById(id: string): OrderDraftEntry | undefined {
        return this.drafts().find(entry => entry.id === id);
    }
}
