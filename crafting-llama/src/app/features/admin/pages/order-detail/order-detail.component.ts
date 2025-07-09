import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { OrdersService } from '@core/catalog/order.service';
import {
    Order,
    OrderNote,
    OrderStatus,
    HydratedOrderEntry,
} from '@core/catalog/order.types';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private ordersService = inject(OrdersService);

    order = signal<Order | null>(null);
    notes = signal<OrderNote[]>([]);
    entries = signal<HydratedOrderEntry[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    noteControl = new FormControl('', [Validators.required]);

    async ngOnInit(): Promise<void> {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Missing order ID');
            return;
        }

        await this.load(id);
    }

    private async load(orderId: string) {
        this.loading.set(true);
        try {
            const [{ order, notes }, entries] = await Promise.all([
                this.ordersService.fetchOrderById(orderId),
                this.ordersService.fetchOrderEntries(orderId),
            ]);
            this.order.set(order);
            this.notes.set(notes);
            this.entries.set(entries);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to load order details.');
        } finally {
            this.loading.set(false);
        }
    }

    resolveValues(entry: HydratedOrderEntry) {
        return Object.entries(entry.values).map(([k, v]) => ({ key: k, value: v }));
    }

    async submitNote() {
        const text = this.noteControl.value?.trim();
        const orderId = this.order()?.id;
        if (!text || !orderId) return;

        const note = await this.ordersService.addNote(orderId, text);
        this.notes.update((n) => [note, ...n]);
        this.noteControl.reset();
    }

    async changeStatus() {
        const o = this.order();
        if (!o) return;

        const next =
            o.status === OrderStatus.New
                ? OrderStatus.Active
                : OrderStatus.Completed;

        const updated = await this.ordersService.updateOrderStatus(o.id, next);
        this.order.set(updated);
    }

    isColorField(key: string, value: string): boolean {
        return (
            key.toLowerCase().includes('color') &&
            typeof value === 'string' &&
            /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)
        );
    }

    filteredValues(entry: HydratedOrderEntry) {
        return this
            .resolveValues(entry)
            .filter((v) => v.key !== 'designId' && v.key !== 'variantId');
    }
}
