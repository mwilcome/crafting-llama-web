import { Injectable, inject, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import {
    BaseProduct,
    BaseProductCategory,
    BaseProductSize,
} from './base-products.types';

/**
 * Central data-access layer for Base Products & Categories.
 * – Uses Supabase RPC directly (no third-party wrappers)
 * – Caches results in signals for fast reactive UI binding
 */
@Injectable({ providedIn: 'root' })
export class BaseProductsService {
    private readonly supabase = inject(SUPABASE_CLIENT);

    /* ────────────────────── reactive caches ────────────────────── */
    readonly categories = signal<BaseProductCategory[]>([]);
    readonly products   = signal<BaseProduct[]>([]);
    readonly sizes      = signal<BaseProductSize[]>([]);

    /* ─────────────────────────── queries ────────────────────────── */

    async fetchCategories(): Promise<void> {
        const { data, error } = await this.supabase
            .from('base_product_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        this.categories.set(data);
    }

    async fetchProducts(): Promise<void> {
        const { data, error } = await this.supabase
            .from('base_products')
            .select('*');

        if (error) throw error;
        this.products.set(data);
    }

    async fetchAllSizes(): Promise<void> {
        const { data, error } = await this.supabase
            .from('base_product_sizes')
            .select('*');

        if (error) throw error;
        this.sizes.set(data);
    }

    async fetchSizesForProduct(productId: string): Promise<void> {
        const { data, error } = await this.supabase
            .from('base_product_sizes')
            .select('*')
            .eq('base_product_id', productId);

        if (error) throw error;
        this.sizes.set(data);
    }

    /* ───────────────────────── mutations ───────────────────────── */

    /* ---------- add ---------- */

    async addCategory(category: Partial<BaseProductCategory>) {
        const { data, error } = await this.supabase
            .from('base_product_categories')
            .insert(category)
            .select()
            .single();

        if (error) throw error;
        this.categories.update(c => [...c, data]);
        return data;
    }

    async addProduct(product: Partial<BaseProduct>) {
        const { data, error } = await this.supabase
            .from('base_products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        this.products.update(p => [...p, data]);
        return data;
    }

    async addSize(size: Partial<BaseProductSize>) {
        const { data, error } = await this.supabase
            .from('base_product_sizes')
            .insert(size)
            .select()
            .single();

        if (error) throw error;
        this.sizes.update(s => [...s, data]);
        return data;
    }

    /* ---------- update ---------- */

    async updateCategory(id: string, patch: Partial<BaseProductCategory>) {
        const { data, error } = await this.supabase
            .from('base_product_categories')
            .update(patch)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        this.categories.update(list =>
            list.map(c => (c.id === id ? data : c))
        );
        return data;
    }

    async updateProduct(id: string, patch: Partial<BaseProduct>) {
        const { data, error } = await this.supabase
            .from('base_products')
            .update(patch)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        this.products.update(list =>
            list.map(p => (p.id === id ? data : p))
        );
        return data;
    }

    async updateSize(id: string, patch: Partial<BaseProductSize>) {
        const { data, error } = await this.supabase
            .from('base_product_sizes')
            .update(patch)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        this.sizes.update(list =>
            list.map(s => (s.id === id ? data : s))
        );
        return data;
    }

    /* ---------- delete ---------- */

    async deleteCategory(id: string) {
        const { error } = await this.supabase
            .from('base_product_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        this.categories.update(list => list.filter(c => c.id !== id));
    }

    async deleteProduct(id: string) {
        const { error } = await this.supabase
            .from('base_products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        this.products.update(list => list.filter(p => p.id !== id));
    }

    async deleteSize(id: string) {
        const { error } = await this.supabase
            .from('base_product_sizes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        this.sizes.update(list => list.filter(s => s.id !== id));
    }

    /* ────────────── convenience helper for admin UI ─────────────── */

    /** Ensures all three tables are in memory (parallel fetch) */
    async prefetchAll(): Promise<void> {
        await Promise.all([
            this.fetchCategories(),
            this.fetchProducts(),
            this.fetchAllSizes(),
        ]);
    }
}
