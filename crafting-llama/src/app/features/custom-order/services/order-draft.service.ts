import { Injectable, signal, computed, effect } from '@angular/core';
import { Design, OrderDraftEntry } from '@core/catalog/design.types';

const DRAFT_KEY = 'llama.draft';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    private drafts = signal<OrderDraftEntry[]>(this.loadDrafts());
    private selectedId = signal<string | null>(null);
    readonly pendingDesign = signal<Design | null>(null); // NEW

    entries = computed(() => this.drafts());
    currentEntry = computed(() =>
        this.entries().find(e => e.id === this.selectedId()) ?? null
    );

    constructor() {
        effect(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(this.drafts()));
        });
    }

    select(id: string) {
        this.selectedId.set(id);
    }

    addEntry(entry: OrderDraftEntry) {
        this.drafts.update(list => [...list, entry]);
        this.select(entry.id);
    }

    updateEntry(id: string, patch: Partial<OrderDraftEntry>) {
        this.drafts.update(list =>
            list.map(e => (e.id === id ? { ...e, ...patch } : e))
        );
    }

    removeEntry(id: string) {
        this.drafts.update(list => list.filter(e => e.id !== id));
        if (this.selectedId() === id) this.selectedId.set(null);
    }

    resetAll() {
        this.drafts.set([]);
        this.selectedId.set(null);
        localStorage.removeItem(DRAFT_KEY);
    }

    private loadDrafts(): OrderDraftEntry[] {
        const raw = localStorage.getItem(DRAFT_KEY);
        try {
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    setPendingDesign(design: Design): void {
        this.pendingDesign.set(design);
    }

    clearPendingDesign(): void {
        this.pendingDesign.set(null);
    }
}
