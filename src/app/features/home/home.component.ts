import { Component, OnInit, inject, computed, Injector, runInInjectionContext } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '@core/seo/seo.service';
import { BaseProductsService } from '@core/catalog/base-products.service';
import { storageUrl } from '@core/storage/storage-url';
import { signal } from '@angular/core';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    private readonly seo = inject(SeoService);
    private readonly base = inject(BaseProductsService);
    private readonly injector = inject(Injector);
    isStandalone = signal(this.checkStandalone());


    readonly categories = this.base.categories;

    readonly cards = computed(() => {
        const cats = this.categories() ?? [];
        return cats.map(c => ({
            id: c.id,
            name: c.name,
            desc: c.description ?? '',
            img: c.image_url
                ? runInInjectionContext(this.injector, () => storageUrl(c.image_url as string))
                : 'assets/images/placeholder/placeholder.png',
        }));
    });

    private checkStandalone(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
    }

    async ngOnInit(): Promise<void> {
        await this.base.fetchCategories();
        this.seo.updateTitle('Handcrafted Embroidery | The Crafting Llama');
        this.seo.updateMetaDescription(
            'Explore handmade embroidery and custom stitched gifts from The Crafting Llama. Personalized creations for every occasion.',
        );
        this.seo.setMetaTags({
            'og:title': 'The Crafting Llama',
            'og:description': 'Handcrafted embroidery for meaningful moments.',
            'og:image': 'https://yourcdn.com/images/llama-og.jpg',
            'og:url': 'https://thecraftingllama.com',
            'twitter:card': 'summary_large_image',
        });

        window.matchMedia('(display-mode: standalone)').addEventListener('change', e => {
            this.isStandalone.set(e.matches);
        });
    }
}
