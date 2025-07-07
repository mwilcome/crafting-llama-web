import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-admin-menu',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './admin-menu.component.html',
    styleUrls: ['./admin-menu.component.scss'],
})
export class AdminMenuComponent {
    @Input({ required: true }) collapsed = false;
    @Output() toggle = new EventEmitter<void>();
}
