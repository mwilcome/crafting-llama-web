import { Injectable, inject, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import {
    BaseProduct,
    BaseProductCategory,
    BaseProductSize,
} from './base-products.types';

/**
 * Central data-access layer for base products & categories.
 * Provided in root so any component can `inject(BaseProductsService)`.
 */
@Injectable({ providedIn: 'root' })
export class BaseProductsService {
    private readonly supabase = inject(SUPABASE_CLIENT);

    /** reactive caches */
    readonly categories = signal<BaseProductCategory[]>([]);
    readonly products   = signal<BaseProduct[]>([]);
    readonly sizes      = signal<BaseProductSize[]>([]);

    /* ---------- queries ---------- */

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

    /* ---------- mutations ---------- */

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
}