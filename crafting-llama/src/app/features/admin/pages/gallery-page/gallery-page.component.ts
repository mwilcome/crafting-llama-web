import {
    Component,
    inject,
    Injector,
    OnInit, runInInjectionContext,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { storageUrl } from "@core/storage/storage-url";
import {ImageUploadComponent} from "@features/admin/ui/image-upload.component";

interface GalleryItem {
    id: string;
    title: string;
    description: string;
    image_url: string;
    tags: string[];
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

@Component({
    selector: 'app-gallery-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
    templateUrl: './gallery-page.component.html',
    styleUrls: ['./gallery-page.component.scss'],
})
export class GalleryPageComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    readonly supabase = inject(SUPABASE_CLIENT);
    readonly injector = inject(Injector);

    form!: FormGroup;
    editingId: string | null = null;
    previewUrl: string | null = null;
    items = signal<GalleryItem[]>([]);
    isUploading = signal(false);

    ngOnInit(): void {
        this.form = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            image_url: ['', Validators.required],
            tags: [''],
            published_at: [''],
        });

        this.loadItems();
    }

    async loadItems() {
        const { data, error } = await this.supabase
            .from('gallery_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        this.items.set(data ?? []);
    }

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.value;
        const payload = {
            title: formValue.title,
            description: formValue.description,
            image_url: formValue.image_url,
            tags: formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length) ?? [],
            published_at: formValue.published_at || null,
        };

        if (this.editingId) {
            const { error } = await this.supabase
                .from('gallery_items')
                .update(payload)
                .eq('id', this.editingId);

            if (error) {
                console.error('Update error:', error);
            }
        } else {
            const { error } = await this.supabase.from('gallery_items').insert([payload]);

            if (error) {
                console.error('Insert error:', error);
            }
        }

        this.form.reset();
        this.editingId = null;
        this.previewUrl = null;
        await this.loadItems();
    }

    edit(item: GalleryItem) {
        this.editingId = item.id;

        this.previewUrl = runInInjectionContext(this.injector, () => storageUrl(item.image_url));

        this.form.patchValue({
            title: item.title,
            description: item.description || '',
            image_url: item.image_url,
            tags: item.tags?.join(', ') ?? '',
            published_at: item.published_at ? item.published_at.split('T')[0] : '',
        });
    }

    async delete(id: string) {
        const { error } = await this.supabase.from('gallery_items').delete().eq('id', id);

        if (error) {
            console.error('Delete error:', error);
        }
        await this.loadItems();
    }

    async onImageSelected(file: File) {
        this.isUploading.set(true);
        const filePath = `gallery/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await this.supabase.storage
            .from('media')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            this.isUploading.set(false);
            return;
        }

        this.form.patchValue({ image_url: filePath });

        this.previewUrl = runInInjectionContext(this.injector, () => storageUrl(filePath));
        this.isUploading.set(false);
    }
}