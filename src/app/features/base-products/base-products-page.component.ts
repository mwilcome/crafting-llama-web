import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BaseProductsService } from "@core/catalog/base-products.service";
import { BaseProduct, BaseProductCategory, BaseProductSize } from "@core/catalog/base-products.types";
import {NgClass} from "@angular/common";

@Component({
    selector: 'app-base-products-page',
    templateUrl: './base-products-page.component.html',
    imports: [
        NgClass
    ],
    styleUrls: ['./base-products-page.component.scss']
})
export class BaseProductsPageComponent implements OnInit {
    private service = inject(BaseProductsService);
    private router = inject(Router);

    categories = this.service.categories;
    products = this.service.products;
    sizes = this.service.sizes;

    selectedCategoryId = signal<string | null>(null);
    selectedProductId = signal<string | null>(null);

    selectedCategory = computed(() => {
        const id = this.selectedCategoryId();
        return id ? this.categories().find(cat => cat.id === id) : null;
    });

    selectedProducts = computed(() => {
        const catId = this.selectedCategoryId();
        if (!catId) return [];
        return this.products().filter(p => p.category_id === catId).map(p => {
            const pSizes = this.sizes().filter(s => s.base_product_id === p.id);
            return { ...p, sizes: pSizes } as BaseProduct & { sizes: BaseProductSize[] };
        });
    });

    selectedProduct = computed(() => {
        const id = this.selectedProductId();
        return id ? this.selectedProducts().find(prod => prod.id === id) : null;
    });

    constructor() {
        effect(() => {
            const cats = this.categories();
            if (cats.length > 0 && !this.selectedCategoryId()) {
                this.selectCategory(cats[0].id);
            }
        });

        effect(() => {
            const prods = this.selectedProducts();
            if (prods.length > 0 && !this.selectedProductId()) {
                this.selectProduct(prods[0].id);
            }
        });
    }

    ngOnInit(): void {
        this.service.fetchCategories();
        this.service.fetchProducts();
        this.service.fetchAllSizes();
    }

    selectCategory(categoryId: string): void {
        this.selectedCategoryId.set(categoryId);
        this.selectedProductId.set(null);
    }

    selectProduct(productId: string): void {
        this.selectedProductId.set(productId);
    }

    startCustomOrder(productId: string): void {
        this.router.navigate(['/custom-order'], { queryParams: { baseId: productId } });
    }
}