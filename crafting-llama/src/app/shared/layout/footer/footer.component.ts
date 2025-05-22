import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  isLlamaVisible = false;
  isWiggling = false;

  onMouseEnter(): void {
    this.isLlamaVisible = true;
    this.isWiggling = true;
    setTimeout(() => {
      this.isWiggling = false;
    }, 2000);
  }

  onMouseLeave(): void {
    this.isLlamaVisible = false;
    this.isWiggling = false;
  }
}
