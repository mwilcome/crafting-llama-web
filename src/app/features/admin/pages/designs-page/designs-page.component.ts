import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DesignService } from '@core/catalog/design.service';
import { Design } from '@core/catalog/design.types';

@Component({
    selector: 'app-designs-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './designs-page.component.html',
    styleUrls: ['./designs-page.component.scss'],
})
export class DesignsPageComponent {
    private svc = inject(DesignService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    designs = this.svc.designs;

    edit(d: Design) {
        this.router.navigate([d.id], { relativeTo: this.route });
    }

    async remove(d: Design) {
        if (!window.confirm(`Delete "${d.name}"?`)) return;
        await this.svc.deleteDesign(d.id);
    }

    create() {
        this.router.navigate(['new'], { relativeTo: this.route });
    }
}
