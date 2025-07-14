import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import {
    HydratedOrderEntry,
    Order,
    OrderNote,
    OrderStatus,
} from './order.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class OrdersService {
    private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);

    async fetchOrders(page = 1, pageSize = 10, idFilter?: string): Promise<Order[]> {
        const { data, error } = await this.supabase.rpc('fetch_orders_with_filter', {
            p_page: page,
            p_page_size: pageSize,
            p_id_filter: idFilter || null
        });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            customerEmail: row.email,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            status: row.status as OrderStatus,
            notesCount: row.notes_count || 0,
        }));
    }

    async fetchOrderEntries(orderId: string): Promise<HydratedOrderEntry[]> {
        const { data, error } = await this.supabase.rpc('fetch_order_entries', {
            order_id: orderId,
        });

        if (error) throw error;

        return (data || []).map((entry: any) => ({
            id: entry.id,
            quantity: entry.quantity,
            values: typeof entry.values === 'string'
                ? JSON.parse(entry.values)
                : entry.values ?? {},
            design: entry.design,
            variant: entry.variant ?? null,
        }));

    }

    async fetchOrderById(orderId: string): Promise<{
        order: Order;
        notes: OrderNote[];
    }> {
        const { data: orderData, error: orderError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError) throw orderError;

        const { data: notesData, error: notesError } = await this.supabase
            .from('order_notes')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (notesError) throw notesError;

        const order: Order = {
            id: orderData.id,
            customerEmail: orderData.email,
            createdAt: orderData.created_at,
            updatedAt: orderData.updated_at,
            status: orderData.status as OrderStatus,
            notesCount: notesData?.length || 0,
        };

        const notes: OrderNote[] = (notesData || []).map((note) => ({
            id: note.id,
            orderId: note.order_id,
            text: note.text,
            createdAt: note.created_at,
            imageUrl: note.image_url ?? null,
        }));

        return { order, notes };
    }

    async addNote(orderId: string, text: string, imageUrl?: string): Promise<OrderNote> {
        const { data, error } = await this.supabase
            .from('order_notes')
            .insert({ order_id: orderId, text, image_url: imageUrl || null })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            orderId: data.order_id,
            text: data.text,
            createdAt: data.created_at,
            imageUrl: data.image_url || null,
        };
    }

    async deleteNote(noteId: string): Promise<void> {
        const { error } = await this.supabase
            .from('order_notes')
            .delete()
            .eq('id', noteId);

        if (error) throw error;
    }

    async updateOrderStatus(
        orderId: string,
        status: OrderStatus
    ): Promise<Order> {
        const { data, error } = await this.supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select('*, order_notes(count)')
            .single();

        if (error) throw error;

        return {
            id: data.id,
            customerEmail: data.email,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            status: data.status as OrderStatus,
            notesCount: data.order_notes[0]?.count || 0,
        };
    }
}