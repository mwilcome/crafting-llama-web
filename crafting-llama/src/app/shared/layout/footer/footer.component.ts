import { Component, signal } from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-footer',
    standalone: true,
    templateUrl: './footer.component.html',
    imports: [
        RouterLink
    ],
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    readonly year = signal(new Date().getFullYear());
}
