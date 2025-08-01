import { Injectable, signal, computed, effect } from '@angular/core';
import { Design, OrderDraftEntry } from '@core/catalog/design.types';

const DRAFT_KEY = 'llama.draft';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    /* ───────── signals ───────── */
    private drafts      = signal<OrderDraftEntry[]>(this.loadDrafts());
    private selectedId  = signal<string | null>(null);
    readonly pendingDesign = signal<Design | null>(null);

    /* ───────── derived ───────── */
    entries      = computed(() => this.drafts());
    currentEntry = computed(() =>
        this.entries().find(e => e.id === this.selectedId()) ?? null
    );

    constructor() {
        /* persist local-storage */
        effect(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(this.drafts()));
        });

        /* auto-clear stale “edit” selection */
        effect(() => {
            const design = this.pendingDesign();
            const entry  = this.currentEntry();
            if (design && entry && design.id !== entry.designId) {
                this.selectedId.set(null);
            }
        });
    }

    /* ───────── api ───────── */
    select(id: string)         { this.selectedId.set(id); }
    clearSelect()              { this.selectedId.set(null); }

    addEntry(entry: OrderDraftEntry) {
        this.drafts.update(arr => [...arr, entry]);
    }

    updateEntry(id: string, patch: Partial<OrderDraftEntry>) {
        this.drafts.update(arr => arr.map(e =>
            e.id === id ? { ...e, ...patch } : e
        ));
    }

    removeEntry(id: string) {
        this.drafts.update(arr => arr.filter(e => e.id !== id));
        if (this.selectedId() === id) this.selectedId.set(null);
    }

    resetAll() {
        this.drafts.set([]);
        this.selectedId.set(null);
        localStorage.removeItem(DRAFT_KEY);
    }

    setPendingDesign(d: Design) { this.pendingDesign.set(d); }
    clearPendingDesign()        { this.pendingDesign.set(null); }

    /* ───────── helpers ───────── */
    private loadDrafts(): OrderDraftEntry[] {
        const raw = localStorage.getItem(DRAFT_KEY);
        try   { return raw ? JSON.parse(raw) : []; }
        catch { return []; }
    }
}
