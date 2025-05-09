import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/layout/header/header.component';
import {LoaderComponent} from "@core/loader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoaderComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-loader></app-loader>
  `
})
export class AppComponent {}
