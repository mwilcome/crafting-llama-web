import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="backdrop" *ngIf="loader.loading$ | async">
      <div class="spinner"></div>
    </div>
  `,
    styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
    constructor(public loader: LoaderService) {}
}
