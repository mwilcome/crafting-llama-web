import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    constructor(private titleService: Title, private metaService: Meta) {}

    updateTitle(title: string): void {
        this.titleService.setTitle(title);
    }

    updateMetaDescription(description: string): void {
        this.metaService.updateTag({ name: 'description', content: description });
    }

    setMetaTags(tags: { [key: string]: string }): void {
        for (const name in tags) {
            this.metaService.updateTag({ name, content: tags[name] });
        }
    }

    clearMetaTags(): void {
        this.metaService.getTags('name').forEach(tag => {
            if (tag.getAttribute('name')) {
                this.metaService.removeTagElement(tag);
            }
        });
    }
}