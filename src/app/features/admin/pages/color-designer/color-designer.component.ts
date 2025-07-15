import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ColorService } from '@core/catalog/color.service';
import { ColorName } from '@core/catalog/color.types';

@Component({
    standalone: true,
    selector: 'app-color-designer',
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './color-designer.component.html',
    styleUrls: ['./color-designer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorDesignerComponent implements OnInit {
    /* ─────────────── main state ─────────────── */
    readonly colors     = signal<ColorName[]>([]);
    readonly loading    = signal(true);
    readonly swatchRows = signal<string[][]>([]);
    readonly hexSignal  = signal('#000000');

    hexControl  = new FormControl('#000000', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]);
    nameControl = new FormControl('', Validators.required);
    tagsControl = new FormControl('');

    nameSearchControl = new FormControl('');
    searchResults = signal<ColorName[]>([]);

    /* edit mode */
    private editingHex = signal<string | null>(null);
    editNameControl = new FormControl('', Validators.required);
    editHexControl  = new FormControl('', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]);
    editTagsControl = new FormControl('');

    /* suggestions */
    suggestedColor   = computed(() => /^#[0-9a-f]{6}$/i.test(this.hexSignal()) ? this.colorService.getClosestColor(this.hexSignal()) : null);
    suggestedName    = computed(() => this.suggestedColor()?.name ?? null);
    suggestedHex     = computed(() => this.suggestedColor()?.hex  ?? null);

    /* grouped colors by tag */
    readonly groupedColors = computed(() => {
        const groups = new Map<string, ColorName[]>();
        this.colors().forEach(c => {
            if (!c.tags || c.tags.length === 0) {
                const uncat = 'Uncategorized';
                if (!groups.has(uncat)) groups.set(uncat, []);
                groups.get(uncat)!.push(c);
            } else {
                c.tags.forEach(tag => {
                    if (!groups.has(tag)) groups.set(tag, []);
                    groups.get(tag)!.push(c);
                });
            }
        });
        return Array.from(groups.entries())
            .map(([tag, colors]) => ({ tag, colors: this.colorService.sortColorsByLightness(colors) }))
            .sort((a, b) => a.tag.localeCompare(b.tag));
    });

    /* accordion state */
    readonly openCategories = signal<string[]>([]);

    constructor(private colorService: ColorService) {}

    async ngOnInit(): Promise<void> {
        this.hexControl.valueChanges.subscribe(v => this.hexSignal.set((v ?? '').toLowerCase()));
        this.swatchRows.set(this.colorService.getRandomSwatchGrid(7, 12));
        const fetchedColors = await this.colorService.fetchColors();
        this.colors.set(this.colorService.sortColorsByLightness(fetchedColors));
        this.openCategories.set(this.groupedColors().map(g => g.tag)); // open all by default
        this.loading.set(false);
    }

    toggleCategory(tag: string) {
        this.openCategories.update(cats =>
            cats.includes(tag) ? cats.filter(t => t !== tag) : [...cats, tag]
        );
    }

    /* ─────────────── add ─────────────── */
    async saveColor(): Promise<void> {
        const hex  = this.hexControl.value?.trim().toLowerCase();
        const name = this.nameControl.value?.trim();
        if (!hex || !name) return;

        const tags = this.parseTags(this.tagsControl.value);
        const added = await this.colorService.addColor({ name, hex, tags });
        this.colors.update(arr => [...arr, added]);

        this.hexControl.setValue('#000000');
        this.nameControl.reset();
        this.tagsControl.reset();
    }

    /* ─────────────── remove ─────────────── */
    async removeColor(hex: string) {
        await this.colorService.deleteColor(hex);
        this.colors.update(arr => arr.filter(c => c.hex !== hex));
    }

    /* ─────────────── edit ─────────────── */
    isEditing(hex: string) { return this.editingHex() === hex; }

    startEdit(c: ColorName) {
        this.editingHex.set(c.hex);
        this.editNameControl.setValue(c.name);
        this.editHexControl.setValue(c.hex);
        this.editTagsControl.setValue((c.tags ?? []).join(', '));
    }

    cancelEdit() {
        this.editingHex.set(null);
        this.editNameControl.reset();
        this.editHexControl.reset();
        this.editTagsControl.reset();
    }

    async saveEdit(originalHex: string) {
        if (this.editNameControl.invalid || this.editHexControl.invalid) return;

        const name = this.editNameControl.value!.trim();
        const hex  = this.editHexControl.value!.trim().toLowerCase();
        const tags = this.parseTags(this.editTagsControl.value);

        await this.colorService.updateColorNameAndHex(originalHex, { name, hex });
        await this.colorService.updateColorTags(hex, tags);

        this.colors.update(arr => arr.map(c => c.hex === originalHex ? { ...c, name, hex, tags } : c));
        this.cancelEdit();
    }

    /* ─────────────── helpers ─────────────── */
    parseTags(raw: string | null): string[] {
        return (raw ?? '')
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
    }

    onColorSelected(e: Event)     { this.hexControl.setValue((e.target as HTMLInputElement).value.toLowerCase()); }
    selectSwatch(hex: string)     { this.hexControl.setValue(hex); }
    onSearchClick()               {
        const q = (this.nameSearchControl.value ?? '').trim().toLowerCase();
        this.searchResults.set(q.length < 3 ? [] : this.colorService.getAllColorNames().filter(c => c.name.toLowerCase().includes(q)));
    }
    selectSearchResult(c: ColorName) { this.hexControl.setValue(c.hex); this.nameControl.setValue(c.name); }
}