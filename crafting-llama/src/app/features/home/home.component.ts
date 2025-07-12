import { Component, OnInit } from '@angular/core';
import { SeoService } from '@core/seo/seo.service';
import { RouterLink } from '@angular/router';

interface Item {
    title: string;
    description: string;
    image: string;
    tag: string;
}

@Component({
    standalone: true,
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    items: Item[] = [
        {
            title: 'Bags',
            description: 'Durable and stylish bags perfect for everyday use, customized with your unique embroidery design.',
            image: 'assets/images/placeholder/bag-placeholder.png', // Replace with actual path or Supabase URL in future
            tag: 'bag'
        },
        {
            title: 'Bibs',
            description: 'Soft, 100% cotton bibs for little ones, embroidered with names or special motifs.',
            image: 'assets/images/placeholder/bib-placeholder.png',
            tag: 'bib'
        },
        {
            title: 'Hats',
            description: 'Trendy hats to top off your look, featuring custom embroidery for a personal flair.',
            image: 'assets/images/placeholder/hat-placeholder.png',
            tag: 'hat'
        },
        {
            title: 'T-Shirts',
            description: 'Comfortable t-shirts in various sizes and colors, ready for your personalized stitchwork.',
            image: 'assets/images/placeholder/tshirt-placeholder.png',
            tag: 'shirt'
        },
    ];

    constructor(private seo: SeoService) {}

    ngOnInit(): void {
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
        // In the future, replace the static items array with a service call, e.g.:
        // this.itemService.getItems().subscribe(items => this.items = items);
    }
}