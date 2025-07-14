import { Injectable } from '@angular/core';
import { OrderDraftEntry } from '@core/catalog/design.types';

export interface OrderRow {
    id: string;
    email: string;
    total: number;
    created_at?: string;
}

export interface OrderEntryRow {
    id: string;
    order_id: string;
    design_id: string;
    variant_id: string | null;
    quantity: number;
    values: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class DesignTransformerService {
    toSupabaseOrder(
        email: string,
        entries: OrderDraftEntry[],
        total: number
    ): {
        order: OrderRow;
        entries: OrderEntryRow[];
    } {
        const orderId = crypto.randomUUID();

        const order: OrderRow = {
            id: orderId,
            email,
            total,
        };

        const mappedEntries: OrderEntryRow[] = entries.map((entry) => ({
            id: crypto.randomUUID(),
            order_id: orderId,
            design_id: entry.designId,
            variant_id: entry.variantId?.trim() || null,
            quantity: entry.quantity,
            values: Object.fromEntries(
                Object.entries(entry.values).filter(
                    ([key, value]) =>
                        typeof value === 'string' &&
                        key !== 'designId' &&
                        key !== 'variantId' &&
                        value.trim() !== ''
                ) as [string, string][]
            ),
        }));

        return { order, entries: mappedEntries };
    }
}
