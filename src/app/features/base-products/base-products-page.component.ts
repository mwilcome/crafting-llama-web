import {
    Component,
    inject,
    signal,
    computed,
    effect,
    runInInjectionContext,
    Injector
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NgClass
} from '@angular/common';
import { BaseProductsService } from '@core/catalog/base-products.service';
import { BaseProduct } from '@core/catalog/base-products.types';
import { storageUrlInjected } from '@core/storage/storage-url';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Component({
    selector: 'app-base-products-page',
    standalone: true,
    imports: [NgClass],
    templateUrl: './base-products-page.component.html',
    styleUrls: ['./base-products-page.component.scss']
})
export class BaseProductsPageComponent {
    private readonly service = inject(BaseProductsService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly injector = inject(Injector);
    private readonly supabase = inject(SUPABASE_CLIENT);

    readonly categories = this.service.categories;
    readonly products = this.service.products;
    readonly sizes = this.service.sizes;
    readonly dataReady = signal(false);

    readonly selectedCategoryId = signal<string | null>(null);
    readonly selectedProductId = signal<string | null>(null);

    constructor() {}

    ngOnInit(): void {
        const paramCatId = this.route.snapshot.queryParamMap.get('category');
        this.service.prefetchAll().then(() => {
            this.dataReady.set(true);

            const cats = this.categories();
            const validCat = cats.find(c => c.id === paramCatId);
            if (paramCatId && validCat) {
                this.selectCategory(paramCatId);
            } else if (cats.length) {
                this.selectCategory(cats[0].id);
            }
        });

        runInInjectionContext(this.injector, () => {
            effect(() => {
                if (!this.dataReady()) return;

                const catId = this.selectedCategoryId();
                const prods = this.selectedProducts();

                if (catId && prods.length && !this.selectedProductId()) {
                    this.selectProduct(prods[0].id);
                }
            });
        });
    }

    selectCategory(categoryId: string) {
        this.selectedCategoryId.set(categoryId);
        this.selectedProductId.set(null);
    }

    selectProduct(productId: string) {
        this.selectedProductId.set(productId);
    }

    startCustomOrder(product: BaseProduct) {
        const tags = (product.tags ?? []).join(',');
        this.router.navigate(
            ['/custom/select'],
            { queryParams: { baseId: product.id, tags } },
        );
    }

    readonly selectedCategory = computed(() => {
        const id = this.selectedCategoryId();
        return this.categories().find(cat => cat.id === id) ?? null;
    });

    readonly selectedProducts = computed(() => {
        const catId = this.selectedCategoryId();
        return this.products().filter(prod => prod.category_id === catId);
    });

    readonly selectedProduct = computed(() => {
        const prodId = this.selectedProductId();
        const match = this.products().find(p => p.id === prodId) ?? null;
        if (!match) return null;

        return {
            ...match,
            sizes: this.sizes().filter(s => s.base_product_id === match.id),
            tags: match.tags ?? [],
            resolved_image_url: storageUrlInjected(this.supabase, match.image_url ?? ''),
        };
    });

    getThumbnailUrl(imagePath: string | undefined): string {
        return storageUrlInjected(this.supabase, imagePath ?? '');
    }
}
