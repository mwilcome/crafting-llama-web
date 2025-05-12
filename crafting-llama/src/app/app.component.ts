import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/layout/header/header.component';
import {LoaderComponent} from "@core/loader/loader.component";
import {ToastComponent} from "@core/toast/toast.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoaderComponent, ToastComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-loader></app-loader>
    <app-toast></app-toast>
  `
})
export class AppComponent {}
