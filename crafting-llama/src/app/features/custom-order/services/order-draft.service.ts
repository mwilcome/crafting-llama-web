import { Injectable, computed, signal } from '@angular/core';
import { OrderDraftEntry } from '@models/order-entry.model';
import { FieldDef } from '@core/catalog/design.types';
import { MOCK_DESIGNS } from '@core/catalog/designs';

const STORAGE_KEY = 'crafting-llama-order-drafts';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
    private readonly drafts = signal<OrderDraftEntry[]>(this.load());
    private readonly activeIndex = signal<number>(0);

    readonly all = computed(() => this.drafts());
    readonly active = computed(() => this.drafts()[this.activeIndex()] ?? null);

    start(entry: Partial<OrderDraftEntry>): void {
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        this.drafts.update((entries) => [
            ...entries,
            {
                id,
                createdAt,
                designId: entry.designId ?? '',
                variantId: '',
                quantity: 1,
                fields: [],
                formData: {},
            },
        ]);

        this.activeIndex.set(this.drafts().length - 1);
        this.save();
    }

    edit(index: number): void {
        this.activeIndex.set(index);
    }

    add(entry: OrderDraftEntry): void {
        this.drafts.update((entries) => [...entries, entry]);
        this.activeIndex.set(this.drafts().length - 1);
        this.save();
    }

    remove(index: number): void {
        this.drafts.update((entries) => entries.filter((_, i) => i !== index));
        this.activeIndex.set(0);
        this.save();
    }

    reset(newDrafts: OrderDraftEntry[]): void {
        this.drafts.set(newDrafts);
        this.activeIndex.set(0);
        this.save();
    }

    hydrateFieldsFromVariant(entry: OrderDraftEntry): void {
        const design = MOCK_DESIGNS.find((d) => d.id === entry.designId);
        const variant = design?.variants?.find((v) => v.id === entry.variantId);

        if (!variant || !variant.fields) return;

        entry.fields = this.coerceFields(variant.fields);

        entry.formData = Object.fromEntries(
            entry.fields.map((f) => [f.key, f.defaultValue ?? ''])
        );

        this.drafts.update((entries) => {
            const copy = [...entries];
            copy[this.activeIndex()] = entry;
            return copy;
        });

        this.save();
    }

    private coerceFields(fields: FieldDef[]): FieldDef[] {
        return fields.map((f) => ({
            key: f.name ?? crypto.randomUUID(),
            name: f.name ?? '',
            label: f.label,
            type: f.type,
            required: f.required ?? false,
            placeholder: f.placeholder,
            defaultValue: f.defaultValue ?? '',
            options: f.options?.map((val) =>
                typeof val === 'string' ? { label: val, value: val } : val
            ),
        }));
    }

    private save(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drafts()));
    }

    private load(): OrderDraftEntry[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
}
