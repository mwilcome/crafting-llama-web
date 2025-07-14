import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements AfterViewInit {
  currentYear = new Date().getFullYear();

  @ViewChild('llamaEl', { static: false }) llamaEl!: ElementRef<HTMLImageElement>;

  ngAfterViewInit(): void {
    if (!this.llamaEl) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.llamaEl.nativeElement.classList.add('active');
          }
        },
        { threshold: 0.5 }
    );

    observer.observe(this.llamaEl.nativeElement);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
