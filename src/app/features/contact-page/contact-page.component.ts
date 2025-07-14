import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ToastService} from "@shared/services/toast/toast.service";
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';


@Component({
    selector: 'app-contact-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    styleUrls: ['./contact-page.component.scss'],
    templateUrl: './contact-page.component.html'
})
export class ContactPageComponent {
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private readonly supabase = inject(SUPABASE_CLIENT);

    contactForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        message: ['', Validators.required],
        website: [''] // Honeypot field
    });

    async onSubmit(): Promise<void> {
        if (this.contactForm.invalid) {
            this.toast.show('Please fill out all required fields.', { type: 'error' });
            return;
        }

        if (this.hasExceededRateLimit()) {
            this.toast.show('Too many submissions. Please try again later.', { type: 'error' });
            return;
        }

        const { name, email, message, website } = this.contactForm.value;

        if (website?.trim()) {
            console.warn('Bot trap triggered.');
            this.toast.show('Something went wrong.', { type: 'error' });
            return;
        }

        const { error } = await this.supabase.from('contact_messages').insert([
            { name, email, message }
        ]);

        if (error) {
            console.error('Error saving contact message:', error.message);
            this.toast.show('Something went wrong. Please try again later.', { type: 'error' });
        } else {
            this.toast.show('Message received. Thank you!', { type: 'success' });
            this.recordSubmission();
            this.contactForm.reset();
        }
    }

    private hasExceededRateLimit(): boolean {
        const maxSubmissions = 5;
        const timeWindowMs = 60 * 60 * 1000;

        const now = Date.now();
        const key = 'contact_form_submissions';
        const history = JSON.parse(localStorage.getItem(key) || '[]') as number[];

        const recent = history.filter(timestamp => now - timestamp < timeWindowMs);

        localStorage.setItem(key, JSON.stringify(recent));

        return recent.length >= maxSubmissions;
    }

    private recordSubmission(): void {
        const key = 'contact_form_submissions';
        const history = JSON.parse(localStorage.getItem(key) || '[]') as number[];
        history.push(Date.now());
        localStorage.setItem(key, JSON.stringify(history));
    }

}
