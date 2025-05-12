import { Directive, ElementRef, HostListener, AfterContentChecked } from '@angular/core';

@Directive({
    selector  : 'textarea[autosize]',
    standalone: true
})
export class AutosizeDirective implements AfterContentChecked {

    constructor(private el: ElementRef<HTMLTextAreaElement>) {}

    ngAfterContentChecked(): void {
        this.adjust();
    }

    @HostListener('input')
    onInput(): void {
        this.adjust();
    }

    private adjust(): void {
        const ta = this.el.nativeElement;
        ta.style.height = 'auto';               // reset
        ta.style.height = ta.scrollHeight + 'px';
    }
}
