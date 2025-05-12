import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '@core/seo/seo.service';
import {RouterLink} from "@angular/router";

@Component({
    standalone: true,
    selector: 'app-home',
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

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
    }
}
