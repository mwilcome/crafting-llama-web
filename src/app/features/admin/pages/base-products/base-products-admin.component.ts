import {
    Component,
    OnInit,
    inject,
    signal,
    computed,
    Injector,
    runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CdkDropList, CdkDrag, DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { storageUrl } from '@core/storage/storage-url';
import { ImageUploadComponent } from '@features/admin/ui/image-upload.component';

import { BaseProductsService } from '@core/catalog/base-products.service';
import {
    BaseProduct,
    BaseProductCategory,
    BaseProductSize,
} from '@core/catalog/base-products.types';
import { AutosizeDirective } from '@shared/directives/autosize.directive';

type Tab = 'categories' | 'products' | 'sizes';

@Component({
    selector: 'app-base-products-admin',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        ImageUploadComponent,
        AutosizeDirective,
    ],
    templateUrl: './base-products-admin.component.html',
    styleUrls: ['./base-products-admin.component.scss'],
})
export class BaseProductsAdminComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly service = inject(BaseProductsService);
    private readonly supabase = inject(SUPABASE_CLIENT);
    private readonly injector = inject(Injector);

    readonly tabs = ['categories', 'products', 'sizes'] as const;
    readonly tab = signal<Tab>('categories');
    readonly selId = signal<string | null>(null);

    readonly categories = this.service.categories;
    readonly products = this.service.products;
    readonly sizes = this.service.sizes;

    readonly productMap = computed(() => {
        const map = new Map<string, BaseProduct>();
        this.products().forEach((p) => map.set(p.id, p));
        return map;
    });

    readonly isUploading = signal(false);
    readonly previewUrl = signal<string | null>(null);

    readonly categoryForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        sub_description: [''],
        image_url: ['', Validators.required],
        sort_order: [0],
    });

    readonly productForm: FormGroup = this.fb.group({
        category_id: ['', Validators.required],
        type: ['', Validators.required],
        description: [''],
        sub_description: [''],
        extra_description: [''],
        image_url: ['', Validators.required],
        price_min: [0, Validators.required],
        price_max: [0, Validators.required],
        tags: [''],
    });

    readonly sizeForm: FormGroup = this.fb.group({
        base_product_id: ['', Validators.required],
        label: ['', Validators.required],
        price_override: [null],
    });

    readonly listForTab = computed<
        (BaseProductCategory | BaseProduct | BaseProductSize)[]
    >(() => {
        switch (this.tab()) {
            case 'categories':
                return [...this.categories()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            case 'products':
                return this.products();
            case 'sizes':
                return [...this.sizes()].sort((a, b) => {
                    const pa = this.productMap().get(a.base_product_id)?.type ?? '';
                    const pb = this.productMap().get(b.base_product_id)?.type ?? '';
                    return pa.localeCompare(pb) || a.label.localeCompare(b.label);
                });
        }
    });

    async ngOnInit() {
        await this.service.prefetchAll();
    }

    setTab(t: Tab) {
        this.tab.set(t);
        this.startAdd();
    }

    singular(t: Tab): string {
        return t === 'categories' ? 'Category' : t === 'products' ? 'Product' : 'Size';
    }

    display(item: BaseProductCategory | BaseProduct | BaseProductSize): string {
        if ('name' in item) return item.name;
        if ('type' in item) return item.type;
        const productName = this.productMap().get(item.base_product_id)?.type ?? 'Unknown';
        return `${productName} – ${item.label}`;
    }

    select(item: BaseProductCategory | BaseProduct | BaseProductSize) {
        this.selId.set(item.id);

        const url =
            'image_url' in item && item.image_url
                ? runInInjectionContext(this.injector, () => storageUrl(item.image_url as string))
                : null;
        this.previewUrl.set(url);

        if (this.tab() === 'categories') {
            this.categoryForm.patchValue(item);
        } else if (this.tab() === 'products') {
            this.productForm.patchValue({
                ...item,
                tags: (item as BaseProduct).tags.join(', '),
            });
        } else {
            this.sizeForm.patchValue(item);
        }
    }

    startAdd(): void {
        this.selId.set(null);
        this.previewUrl.set(null);
        this.categoryForm.reset({ sort_order: 0 });
        this.productForm.reset({ price_min: 0, price_max: 0 });
        this.sizeForm.reset();
    }

    async onHeroSelected(file: File) {
        this.isUploading.set(true);
        const path = `products/${crypto.randomUUID()}-${file.name}`;
        const { error } = await this.supabase.storage.from('media').upload(path, file);
        if (error) {
            console.error(error);
            this.isUploading.set(false);
            return;
        }

        const url = runInInjectionContext(this.injector, () => storageUrl(path));

        if (this.tab() === 'categories') {
            this.categoryForm.patchValue({ image_url: path });
        } else if (this.tab() === 'products') {
            this.productForm.patchValue({ image_url: path });
        }

        this.previewUrl.set(url);
        this.isUploading.set(false);
    }

    async saveCategory() {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }
        const id = this.selId();
        id
            ? await this.service.updateCategory(id, this.categoryForm.value)
            : await this.service.addCategory(this.categoryForm.value);
        this.startAdd();
    }

    async saveProduct() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }
        const v = this.productForm.value;
        const patch = {
            ...v,
            tags: (v.tags as string).split(',').map((t) => t.trim()).filter(Boolean),
        };
        const id = this.selId();
        id
            ? await this.service.updateProduct(id, patch)
            : await this.service.addProduct(patch);
        this.startAdd();
    }

    async saveSize() {
        if (this.sizeForm.invalid) {
            this.sizeForm.markAllAsTouched();
            return;
        }
        const id = this.selId();
        id
            ? await this.service.updateSize(id, this.sizeForm.value)
            : await this.service.addSize(this.sizeForm.value);
        this.startAdd();
    }

    async deleteSelected() {
        const id = this.selId();
        if (!id) return;
        if (this.tab() === 'categories') await this.service.deleteCategory(id);
        else if (this.tab() === 'products') await this.service.deleteProduct(id);
        else await this.service.deleteSize(id);
        this.startAdd();
    }

    protected sidebarItems() {
        const src = [...this.listForTab()];
        return src.map((item) => ({ item }));
    }

    async onCategoryDrop(event: CdkDragDrop<BaseProductCategory[]>) {
        const categories = [...this.categories()];
        moveItemInArray(categories, event.previousIndex, event.currentIndex);

        const updates: Promise<any>[] = [];

        categories.forEach((cat, i) => {
            if (cat.sort_order !== i + 1) {
                cat.sort_order = i + 1;
                updates.push(this.service.updateCategory(cat.id, { sort_order: cat.sort_order }));
            }
        });

        await Promise.all(updates);
        this.categories.set(categories);
    }
}
