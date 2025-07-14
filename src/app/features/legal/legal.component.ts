import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-legal',
    imports: [CommonModule, RouterLink],
    templateUrl: './legal.component.html',
    styleUrls: ['./legal.component.scss']
})
export class LegalComponent {}
