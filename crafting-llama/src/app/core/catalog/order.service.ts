import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderNote, OrderStatus } from './order.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class OrdersService {
    private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);

    async fetchOrders(page = 1, pageSize = 10): Promise<Order[]> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await this.supabase
            .from('orders')
            .select('*, order_notes(count)')
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            customerEmail: row.customer_email,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            status: row.status as OrderStatus,
            notesCount: row.order_notes?.length || 0,
        }));
    }

    async fetchOrderById(orderId: string): Promise<{ order: Order; notes: OrderNote[] }> {
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
            customerEmail: orderData.customer_email,
            createdAt: orderData.created_at,
            updatedAt: orderData.updated_at,
            status: orderData.status as OrderStatus,
            notesCount: notesData?.length || 0,
        };

        const notes: OrderNote[] = (notesData || []).map(note => ({
            id: note.id,
            orderId: note.order_id,
            text: note.text,
            createdAt: note.created_at,
        }));

        return { order, notes };
    }

    async addNote(orderId: string, text: string): Promise<OrderNote> {
        const { data, error } = await this.supabase
            .from('order_notes')
            .insert({ order_id: orderId, text })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            orderId: data.order_id,
            text: data.text,
            createdAt: data.created_at,
        };
    }

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
        const { data, error } = await this.supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            customerEmail: data.customer_email,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            status: data.status as OrderStatus,
            notesCount: 0,
        };
    }
}
