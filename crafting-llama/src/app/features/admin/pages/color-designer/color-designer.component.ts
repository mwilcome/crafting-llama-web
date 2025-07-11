import {
    Component,
    OnInit,
    signal,
    computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ColorService } from '@core/catalog/color.service';
import { ColorName } from '@core/catalog/color.types';

@Component({
    standalone: true,
    selector: 'app-color-designer',
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './color-designer.component.html',
    styleUrls: ['./color-designer.component.scss'],
})
export class ColorDesignerComponent implements OnInit {
    readonly colors = signal<ColorName[]>([]);
    readonly loading = signal(true);
    readonly swatchRows = signal<string[][]>([]);
    readonly hexSignal = signal<string>('#000000');

    readonly hexControl = new FormControl('#000000', [
        Validators.required,
        Validators.pattern(/^#[0-9A-Fa-f]{6}$/),
    ]);
    readonly nameControl = new FormControl('', Validators.required);

    // New search-based logic
    readonly nameSearchControl = new FormControl('');
    readonly searchResults = signal<ColorName[]>([]);

    readonly suggestedColor = computed(() => {
        const hex = this.hexSignal();
        if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
        return this.colorService.getClosestColor(hex);
    });

    readonly suggestedName = computed(() =>
        this.suggestedColor()?.name ?? null
    );

    readonly suggestedHex = computed(() =>
        this.suggestedColor()?.hex ?? null
    );

    constructor(private readonly colorService: ColorService) {}

    async ngOnInit(): Promise<void> {
        this.hexControl.valueChanges.subscribe((value) => {
            this.hexSignal.set(value?.trim().toLowerCase() ?? '');
        });

        this.swatchRows.set(this.colorService.getRandomSwatchGrid(7, 12));

        const loaded = await this.colorService.fetchColors();
        const sorted = this.colorService.sortColorsByLightness(loaded);
        this.colors.set(sorted);
        this.loading.set(false);
    }

    async saveColor(): Promise<void> {
        const hex = this.hexControl.value?.trim().toLowerCase();
        const name = this.nameControl.value?.trim();
        if (!hex || !name) return;

        const added = await this.colorService.addColor({ hex, name });
        this.colors.update((c) => [...c, added]);

        this.hexControl.setValue('#000000');
        this.nameControl.setValue('');
    }

    async removeColor(hex: string): Promise<void> {
        await this.colorService.deleteColor(hex);
        this.colors.update((c) => c.filter((entry) => entry.hex !== hex));
    }

    onColorSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.hexControl.setValue(input.value.toLowerCase());
    }

    selectSwatch(hex: string): void {
        this.hexControl.setValue(hex);
    }

    onSearchClick(): void {
        const query = this.nameSearchControl.value?.trim().toLowerCase() ?? '';
        if (query.length < 3) {
            this.searchResults.set([]);
            return;
        }

        const matches = this.colorService.getAllColorNames()
            .filter((c) => c.name.toLowerCase().includes(query));
        this.searchResults.set(matches);
    }

    selectSearchResult(color: ColorName): void {
        this.hexControl.setValue(color.hex);
        this.nameControl.setValue(color.name);
    }
}
