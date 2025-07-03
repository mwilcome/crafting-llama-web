import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-admin-menu',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
    <nav class="admin-menu" [class.collapsed]="collapsed">
      <button class="hamburger" (click)="toggle.emit()">
        ☰
      </button>

      <ul>
        <li><a routerLink="orders"  routerLinkActive="active">View Orders</a></li>
        <li><a routerLink="custom"  routerLinkActive="active">Edit Custom</a></li>
        <li><a routerLink="gallery" routerLinkActive="active">Edit Gallery</a></li>
        <li><a routerLink="notes"   routerLinkActive="active">Update Order Notes</a></li>
      </ul>
    </nav>
  `
})
export class AdminMenuComponent {
    @Input({ required: true }) collapsed = false;
    @Output() toggle = new EventEmitter<void>();
}
