import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@core/seo/seo.service';
import { BaseProductsService } from '@core/catalog/base-products.service';
import { storageUrl } from '@core/storage/storage-url';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    /* ── injections ───────────────────── */
    private readonly seo  = inject(SeoService);
    private readonly base = inject(BaseProductsService);

    /* ── reactive state ────────────────── */
    readonly categories = this.base.categories;          // signal<BaseProductCategory[]>
    /** Home-page cards derived from categories */
    readonly cards = computed(() =>
        this.categories().map(c => ({
            id:   c.id,
            name: c.name,
            desc: c.description ?? '',
            img:  c.image_url ? storageUrl(c.image_url) : 'assets/images/placeholder/placeholder.png',
        })),
    );

    /* ── lifecycle ─────────────────────── */
    async ngOnInit() {
        await this.base.fetchCategories();
        this.seo.updateTitle('Handcrafted Embroidery | The Crafting Llama');
        this.seo.updateMetaDescription(
            'Explore handmade embroidery and custom stitched gifts from The Crafting Llama. Personalized creations for every occasion.'
        );
        this.seo.setMetaTags({
            'og:title': 'The Crafting Llama',
            'og:description': 'Handcrafted embroidery for meaningful moments.',
            'og:image': 'https://yourcdn.com/images/llama-og.jpg',
            'og:url': 'https://thecraftingllama.com',
            'twitter:card': 'summary_large_image'
        });
    }
}