import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminMenuComponent } from './admin-menu.component';

@Component({
    selector: 'app-admin-shell',
    standalone: true,
    imports: [AdminMenuComponent, RouterOutlet],
    template: `
        <div class="admin-layout">
            <app-admin-menu
                    [collapsed]="collapsed()"
                    (toggle)="toggleSidebar()">
            </app-admin-menu>

            <main class="admin-main" [class.collapsed]="collapsed()">
                <router-outlet></router-outlet>
            </main>
        </div>
    `
})
export class AdminShellComponent {
    /** signal-based state */
    collapsed = signal(false);

    /** called from template */
    toggleSidebar(): void {
        this.collapsed.update(v => !v);
    }
}
