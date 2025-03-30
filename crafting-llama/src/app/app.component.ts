import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FeaturedProductsComponent } from './featured-products/featured-products.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FeaturedProductsComponent,
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-featured-products></app-featured-products>
    <app-footer></app-footer>
  `,
  styles: []
})
export class AppComponent {
  title = 'crafting-llama';
}