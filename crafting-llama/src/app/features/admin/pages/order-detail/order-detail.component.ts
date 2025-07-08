import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormControl, Validators, FormsModule} from '@angular/forms';
import {OrdersService} from "@core/catalog/order.service";
import {Order, OrderNote, OrderStatus} from "@core/catalog/order.types";

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

    readonly order = signal<Order | null>(null);
    readonly notes = signal<OrderNote[]>([]);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    readonly noteControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Missing order ID.');
            return;
        }
        await this.load(id);
    }

    async load(orderId: string): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const { order, notes } = await this.ordersService.fetchOrderById(orderId);
            this.order.set(order);
            this.notes.set([...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        } catch (err) {
            this.error.set('Failed to load order details.');
        } finally {
            this.loading.set(false);
        }
    }

    async submitNote(): Promise<void> {
        if (this.noteControl.invalid || !this.order()?.id) return;

        const text = this.noteControl.value.trim();
        if (!text) return;

        try {
            const note = await this.ordersService.addNote(this.order()!.id, text);
            this.notes.update(n => [note, ...n]);
            this.noteControl.reset();
        } catch (err) {
            alert('Failed to add note');
        }
    }

    async changeStatus(): Promise<void> {
        const current = this.order()?.status;
        if (!current || current === OrderStatus.Completed) return;

        const nextStatus = current === OrderStatus.New ? OrderStatus.Active : OrderStatus.Completed;
        try {
            const updated = await this.ordersService.updateOrderStatus(this.order()!.id, nextStatus);
            this.order.set(updated);
        } catch (err) {
            alert('Failed to update status');
        }
    }
}
