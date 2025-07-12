import {
    Component,
    OnInit,
    inject,
    signal,
    runInInjectionContext,
    Injector
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    FormControl,
    ReactiveFormsModule,
    Validators,
    FormsModule,
} from '@angular/forms';
import { CommonModule, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';

import { OrdersService } from '@core/catalog/order.service';
import {
    Order,
    OrderNote,
    OrderStatus,
    HydratedOrderEntry,
} from '@core/catalog/order.types';
import { ImageUploadComponent } from '@features/admin/ui/image-upload.component';
import { storageUrl } from '@core/storage/storage-url';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { ColorService } from "@core/catalog/color.service";

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ImageUploadComponent, DatePipe, TitleCasePipe, DecimalPipe],
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private ordersService = inject(OrdersService);
    private injector = inject(Injector);
    private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);
    private readonly colorService = inject(ColorService);

    order = signal<Order | null>(null);
    notes = signal<OrderNote[]>([]);
    entries = signal<HydratedOrderEntry[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    noteControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
    previewUrl: string | null = null;
    imagePath = signal<string | null>(null);

    async ngOnInit(): Promise<void> {
        await this.colorService.loadColors();
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set('Missing order ID');
            return;
        }

        await this.load(id);
    }

    resolveColorName(hex: string): string {
        return this.colorService.getColorName(hex) || hex;
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

    filteredValues(entry: HydratedOrderEntry) {
        return Object.entries(entry.values)
            .filter(([k]) => k !== 'designId' && k !== 'variantId')
            .map(([k, v]) => ({ key: k, value: v }));
    }

    isColorField(key: string, value: string): boolean {
        return (
            key.toLowerCase().includes('color') &&
            typeof value === 'string' &&
            /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)
        );
    }

    async changeStatus() {
        const o = this.order();
        if (!o) return;

        const next =
            o.status === OrderStatus.New
                ? OrderStatus.Active
                : OrderStatus.Completed;

        const updated = await this.ordersService.updateOrderStatus(o.id, next);
        this.order.set({ ...updated, notesCount: this.notes().length });
    }

    async submitNote() {
        const text = this.noteControl.value?.trim();
        const orderId = this.order()?.id;
        if (!text || !orderId) return;

        const image = this.imagePath();
        const note = await this.ordersService.addNote(orderId, text, image ?? undefined);
        this.notes.update((n) => [note, ...n]);

        this.order.update(o => o ? { ...o, notesCount: o.notesCount + 1 } : o);

        this.noteControl.reset();
        this.previewUrl = null;
        this.imagePath.set(null);
    }

    async onImageSelected(file: File) {
        const filename = `${crypto.randomUUID()}-${file.name}`;
        const filePath = `orders/${filename}`;

        const { error } = await this.supabase.storage
            .from('media')
            .upload(filePath, file);

        if (error) {
            console.error('[Image upload failed]', error);
            return;
        }

        this.imagePath.set(filePath);
        this.previewUrl = runInInjectionContext(this.injector, () => storageUrl(filePath));
    }

    getPublicUrl(path?: string | null): string {
        return path ? runInInjectionContext(this.injector, () => storageUrl(path)) : '';
    }

    async deleteNote(noteId: string) {
        const confirmed = confirm('Are you sure you want to delete this note?');
        if (!confirmed) return;

        try {
            await this.ordersService.deleteNote(noteId);
            this.notes.update(n => n.filter(note => note.id !== noteId));
            this.order.update(o => o ? { ...o, notesCount: o.notesCount - 1 } : o);
        } catch (err) {
            console.error('[Delete note failed]', err);
            alert('Could not delete note.');
        }
    }
}