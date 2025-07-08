import {inject, signal, computed, Injectable, runInInjectionContext, Injector} from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import {storageUrl} from "@core/storage/storage-url";

export interface GalleryItem {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    tags: string[];
    publishedAt?: string;
    fullUrl: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
    private readonly supabase = inject(SUPABASE_CLIENT);
    private readonly injector = inject(Injector);

    private readonly _items = signal<GalleryItem[]>([]);
    readonly items = computed(() => this._items());

    private version = -1;
    private pollHandle?: ReturnType<typeof setInterval>;

    private readonly resolveStorageUrl: (path: string) => string;

    constructor() {
        this.resolveStorageUrl = (path: string) => storageUrl(path);

        const cached = localStorage.getItem('gallery');
        if (cached) this._items.set(JSON.parse(cached));

        this.refresh().finally(() =>
            localStorage.setItem('gallery', JSON.stringify(this._items()))
        );

        this.startPolling();
    }

    async refresh(): Promise<void> {
        const { data, error } = await this.supabase
            .from('gallery_items')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) throw error;

        const items: GalleryItem[] = (data ?? []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description ?? '',
            imageUrl: r.image_url,
            tags: r.tags ?? [],
            publishedAt: r.published_at ?? undefined,
            fullUrl: runInInjectionContext(this.injector, () => storageUrl(r.image_url)),
        }));

        this._items.set(items);
    }

    private startPolling(everySeconds = 30): void {
        if (this.pollHandle) clearInterval(this.pollHandle);
        this.pollHandle = setInterval(() => void this.checkVersion(), everySeconds * 1_000);
        void this.checkVersion();
    }

    private async checkVersion(): Promise<void> {
        const { data } = await this.supabase
            .from('entity_version')
            .select('version')
            .eq('entity', 'gallery')
            .maybeSingle();

        if (!data || data.version === this.version) return;
        this.version = data.version;
        await this.refresh();
    }
}
