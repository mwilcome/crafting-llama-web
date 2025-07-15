import { inject, Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { ColorName } from './color.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import colorNameData from './color-names.json';

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

    async updateColorTags(hex: string, newTags: string[]): Promise<void> {
        const { error } = await this.supabase
            .from('color_names')
            .update({ tags: newTags })
            .eq('hex', hex);

        if (error) throw error;
    }

    async updateColorNameAndHex(originalHex: string, update: { name: string; hex: string }): Promise<void> {
        const { error } = await this.supabase
            .from('color_names')
            .update(update)
            .eq('hex', originalHex);

        if (error) throw error;
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
        const { data, error } = await this.supabase.from('color_names').select('*');

        if (error) throw error;

        const map = new Map<string, string>();
        (data || []).forEach((entry) => map.set(entry.hex.toLowerCase(), entry.name));
        this._colorMap.set(map);
    }

    getColorName(hex: string): string | null {
        return this.getClosestColor(hex)?.name ?? null;
    }

    getAllColorNames(): ColorName[] {
        return Array.from(this._colorMap().entries()).map(([hex, name]) => ({
            hex,
            name,
        }));
    }

    getClosestColor(hex: string): ColorName | null {
        const normalized = hex.trim().toLowerCase();
        const map = this._colorMap();
        let closest: ColorName | null = null;
        let minDistance = Infinity;

        for (const [knownHex, name] of map.entries()) {
            const distance = this.colorDistance(normalized, knownHex);
            if (distance < minDistance) {
                minDistance = distance;
                closest = { hex: knownHex, name };
            }
        }

        return closest;
    }

    async loadColorNameMapFromLocal(): Promise<void> {
        const map = new Map<string, string>();
        for (const entry of colorNameData as ColorName[]) {
            map.set(entry.hex.trim().toLowerCase(), entry.name.trim());
        }
        this._colorMap.set(map);
    }

    getRandomSwatchGrid(rows: number, cols: number): string[][] {
        const flat = Array.from(this._colorMap().keys());
        const shuffled = flat.sort(() => 0.5 - Math.random()).slice(0, rows * cols);

        const grid: string[][] = [];
        for (let r = 0; r < rows; r++) {
            grid.push(shuffled.slice(r * cols, (r + 1) * cols));
        }

        return grid;
    }

    sortColorsByLightness(colors: ColorName[]): ColorName[] {
        return [...colors].sort((a, b) => {
            const l1 = this.hexToHsl(a.hex).l;
            const l2 = this.hexToHsl(b.hex).l;
            return l2 - l1;
        });
    }

    private hexToHsl(hex: string): { h: number; s: number; l: number } {
        let r = 0,
            g = 0,
            b = 0;
        const hexClean = hex.replace('#', '');

        if (hexClean.length === 6) {
            r = parseInt(hexClean.substring(0, 2), 16) / 255;
            g = parseInt(hexClean.substring(2, 4), 16) / 255;
            b = parseInt(hexClean.substring(4, 6), 16) / 255;
        }

        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h = 0,
            s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h *= 60;
        }

        return { h, s: s * 100, l: l * 100 };
    }

    private hexToRgb(hex: string): [number, number, number] {
        const clean = hex.replace('#', '');
        return [
            parseInt(clean.slice(0, 2), 16),
            parseInt(clean.slice(2, 4), 16),
            parseInt(clean.slice(4, 6), 16),
        ];
    }

    private colorDistance(hex1: string, hex2: string): number {
        const [r1, g1, b1] = this.hexToRgb(hex1);
        const [r2, g2, b2] = this.hexToRgb(hex2);
        return Math.sqrt(
            Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
        );
    }
}
