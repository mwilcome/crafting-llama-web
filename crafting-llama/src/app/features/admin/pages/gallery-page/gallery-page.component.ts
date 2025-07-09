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
} from '@angular/forms';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import {ImageUploadComponent} from "@features/admin/ui/image-upload.component";
import {storageUrl} from "@core/storage/storage-url";

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

    ngOnInit(): void {
        this.form = this.fb.group({
            title: [''],
            description: [''],
            image_url: [''],
            tags: [[]],
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

        this.items.set(data);
    }

    async onSubmit() {
        const formValue = this.form.value;
        const payload = {
            title: formValue.title,
            description: formValue.description,
            image_url: formValue.image_url,
            tags: formValue.tags ?? [],
            published_at: formValue.published_at || null,
        };

        if (this.editingId) {
            await this.supabase
                .from('gallery_items')
                .update(payload)
                .eq('id', this.editingId);
        } else {
            await this.supabase.from('gallery_items').insert([payload]);
        }

        this.form.reset();
        this.editingId = null;
        this.previewUrl = null;
        await this.loadItems();
    }

    edit(item: GalleryItem) {
        this.editingId = item.id;

        runInInjectionContext(this.injector, () => {
            this.previewUrl = storageUrl(item.image_url);
        });

        this.form.patchValue({
            title: item.title,
            description: item.description,
            image_url: item.image_url,
            tags: item.tags ?? [],
            published_at: item.published_at?.split('T')[0] ?? '',
        });
    }

    async delete(id: string) {
        await this.supabase.from('gallery_items').delete().eq('id', id);
        await this.loadItems();
    }

    async onImageSelected(file: File) {
        const filePath = `gallery/${crypto.randomUUID()}-${file.name}`;
        const { error } = await this.supabase.storage
            .from('media')
            .upload(filePath, file);

        if (error) {
            console.error(error);
            return;
        }

        this.form.patchValue({ image_url: filePath });

        runInInjectionContext(this.injector, () => {
            this.previewUrl = storageUrl(filePath);
        });
    }

    onTagInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const tags = input.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length);
        this.form.patchValue({ tags });
    }
}
