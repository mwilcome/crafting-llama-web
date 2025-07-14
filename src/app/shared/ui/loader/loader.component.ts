import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader/loader.service';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="backdrop" *ngIf="loader.loading$ | async">
      <div class="spinner"></div>
    </div>
  `,
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
    constructor(public loader: LoaderService) {}
}
