import {inject, Injectable, signal} from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { ColorName } from './color.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class ColorService {
    private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);
    private readonly _colorMap = signal<Map<string, string>>(new Map());

    async fetchColors(): Promise<ColorName[]> {
        const { data, error } = await this.supabase
            .from('color_names')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async addColor(color: ColorName): Promise<ColorName> {
        const { data, error } = await this.supabase
            .from('color_names')
            .insert(color)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteColor(hex: string): Promise<void> {
        const { error } = await this.supabase
            .from('color_names')
            .delete()
            .eq('hex', hex);

        if (error) throw error;
    }

    async loadColors(): Promise<void> {
        const { data, error } = await this.supabase
            .from('color_names')
            .select('*');

        if (error) throw error;

        const map = new Map<string, string>();
        (data || []).forEach(entry => map.set(entry.hex.toLowerCase(), entry.name));
        this._colorMap.set(map);
    }

    getColorName(hex: string): string | null {
        return this._colorMap().get(hex.toLowerCase()) ?? null;
    }
}
