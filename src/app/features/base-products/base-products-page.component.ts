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

@Component({
    selector: 'app-base-products-page',
    standalone: true,
    templateUrl: './base-products-page.component.html',
    styleUrls: ['./base-products-page.component.scss'],
    imports: [NgClass],
})
export class BaseProductsPageComponent implements OnInit {
    /* ───────── injections ───────── */
    private readonly service = inject(BaseProductsService);
    private readonly router  = inject(Router);
    private readonly route   = inject(ActivatedRoute);

    /* ───────── caches ──────────── */
    readonly categories = this.service.categories;
    readonly products   = this.service.products;
    readonly sizes      = this.service.sizes;

    /* ───────── ui-state ────────── */
    readonly selectedCategoryId = signal<string | null>(null);
    readonly selectedProductId  = signal<string | null>(null);

    /* ───────── derived ─────────── */
    readonly selectedCategory = computed(() => {
        const id = this.selectedCategoryId();
        return id ? this.categories().find(c => c.id === id) ?? null : null;
    });

    readonly selectedProducts = computed(() => {
        const catId = this.selectedCategoryId();
        if (!catId) return [];
        return this.products()
            .filter(p => p.category_id === catId)
            .map(p => {
                const pSizes = this.sizes().filter(s => s.base_product_id === p.id);
                return { ...p, sizes: pSizes } as BaseProduct & { sizes: BaseProductSize[] };
            });
    });

    readonly selectedProduct = computed(() => {
        const id = this.selectedProductId();
        return id ? this.selectedProducts().find(p => p.id === id) ?? null : null;
    });

    /* ───────── constructor effects ─ */
    constructor() {
        /* pick first category once loaded */
        effect(() => {
            const cats = this.categories();
            if (cats.length && !this.selectedCategoryId()) {
                this.selectCategory(cats[0].id);
            }
        });

        /* pick first product whenever category changes */
        effect(() => {
            const prods = this.selectedProducts();
            if (prods.length && !this.selectedProductId()) {
                this.selectProduct(prods[0].id);
            }
        });
    }

    /* ───────── lifecycle ───────── */
    async ngOnInit() {
        /* honour ?category= on deep-link */
        const preSel = this.route.snapshot.queryParamMap.get('category');
        if (preSel) this.selectCategory(preSel);

        await Promise.all([
            this.service.fetchCategories(),
            this.service.fetchProducts(),
            this.service.fetchAllSizes(),
        ]);
    }

    /* ───────── ui handlers ─────── */
    selectCategory(id: string)          { this.selectedCategoryId.set(id); this.selectedProductId.set(null); }
    selectProduct(id: string)           { this.selectedProductId.set(id); }

    /** Navigate to the Design-Selector with the product’s tags pre-selected */
    startCustomOrder(product: BaseProduct): void {
        const tags = (product.tags ?? []).join(',');
        this.router.navigate(
            ['/custom/select'],
            { queryParams: { baseId: product.id, tags } },
        );
    }
}
