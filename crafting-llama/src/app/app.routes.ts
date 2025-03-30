import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero.component';

export const routes: Routes = [
  { path: '', component: HeroComponent }, // Landing page
  { path: 'shop', redirectTo: '' },
  { path: 'custom', redirectTo: '' },
  { path: 'contact', redirectTo: '' },
];