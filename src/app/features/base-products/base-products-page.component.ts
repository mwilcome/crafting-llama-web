import {
    Component,
    computed,
    effect,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { BaseProductsService } from '@core/catalog/base-products.service';
import {
    BaseProduct,
    BaseProductCategory,
    BaseProductSize,
} from '@core/catalog/base-products.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Component({
    selector: 'app-base-products-page',
    standalone: true,
    templateUrl: './base-products-page.component.html',
    styleUrls: ['./base-products-page.component.scss'],
    imports: [NgClass],
})
export class BaseProductsPageComponent implements OnInit {
    /* ───────── injections ───────── */
    private readonly service   = inject(BaseProductsService);
    private readonly router    = inject(Router);
    private readonly route     = inject(ActivatedRoute);
    private readonly supabase  = inject(SUPABASE_CLIENT);

    /* ───────── caches ──────────── */
    readonly categories = this.service.categories;
    readonly products   = this.service.products;
    readonly sizes      = this.service.sizes;

    /* ───────── ui-state ────────── */
    readonly selectedCategoryId = signal<string | null>(null);
    readonly selectedProductId  = signal<string | null>(null);

    /* ───────── readiness check ──────── */
    readonly dataReady = computed(() =>
        this.categories().length > 0 &&
        this.products().length > 0 &&
        this.sizes().length > 0
    );

    /* ───────── derived ─────────── */
    readonly selectedCategory = computed(() => {
        const id = this.selectedCategoryId();
        return id ? this.categories().find(c => normalize(c.id) === normalize(id)) ?? null : null;
    });

    readonly selectedProducts = computed(() => {
        const catId = this.selectedCategoryId();
        if (!catId) return [];

        return this.products()
            .filter(p => normalize(p.category_id) === normalize(catId))
            .map(p => Object.assign({}, p, {
                sizes: this.sizes().filter(s => s.base_product_id === p.id),
                resolved_image_url: this.storageUrlLocal(p.image_url ?? ''),
            }));
    });

    readonly selectedProduct = computed(() => {
        const id = this.selectedProductId();
        return id ? this.selectedProducts().find(p => p.id === id) ?? null : null;
    });

    /* ───────── constructor effects ─ */
    constructor() {
        effect(() => {
            if (this.dataReady() && !this.selectedCategoryId()) {
                this.selectCategory(this.categories()[0].id);
            }
        });

        effect(() => {
            if (this.dataReady() && !this.selectedProductId() && this.selectedProducts().length) {
                this.selectProduct(this.selectedProducts()[0].id);
            }
        });
    }

    /* ───────── lifecycle ───────── */
    async ngOnInit() {
        const preSel = this.route.snapshot.queryParamMap.get('category');
        if (preSel) this.selectCategory(preSel);

        await Promise.all([
            this.service.fetchCategories(),
            this.service.fetchProducts(),
            this.service.fetchAllSizes(),
        ]);
    }

    /* ───────── ui handlers ─────── */
    selectCategory(id: string) {
        this.selectedCategoryId.set(id);
        this.selectedProductId.set(null);
    }

    selectProduct(id: string) {
        this.selectedProductId.set(id);
    }

    startCustomOrder(product: BaseProduct): void {
        const tags = (product.tags ?? []).join(',');
        this.router.navigate(
            ['/custom/select'],
            { queryParams: { baseId: product.id, tags } },
        );
    }

    /* ───────── storage URL helper ──────── */
    private storageUrlLocal(path: string): string {
        return this.supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
    }
}

/* ───────── helpers ───────── */
function normalize(id: unknown): string {
    return String(id ?? '').normalize('NFKC').trim().toLowerCase();
}
