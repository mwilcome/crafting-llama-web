import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldDef } from '@core/catalog/design.types';

@Component({
    standalone: true,
    selector: 'field-renderer',
    imports: [CommonModule],
    template: `
    <div class="field-renderer">
      @for (f of fields; track f.key) {
        <div class="field" [class.req]="f.required">
          <label>{{ f.label }}</label>

          @switch (f.type) {
            @case ('textarea') {
              <textarea [placeholder]="f.placeholder" disabled></textarea>
            }
            @case ('checkbox') {
              <input type="checkbox" disabled />
            }
            @case ('dropdown') {
              <select disabled>
                @for (opt of f.options ?? []; track opt.value) {
                  <option>{{ opt.label }}</option>
                }
              </select>
            }
            @case ('radio') {
              @for (opt of f.options ?? []; track opt.value) {
                <label><input type="radio" disabled /> {{ opt.label }}</label>
              }
            }
            @case ('file') {
              <input type="file" disabled />
            }
            @case ('color') {
              <input type="color" disabled />
            }
            @default {
              <input type="text" [placeholder]="f.placeholder" disabled />
            }
          }
        </div>
      }
    </div>
  `,
    styles: [
        `
    .field-renderer { display: grid; gap: .75rem; }
    .field { display: flex; flex-direction: column; }
    .field.req label::after { content: ' *'; color: red; }
    .field input[disabled],
    .field textarea[disabled],
    .field select[disabled] {
      background: #fafafa;
      border: 1px solid #ccc;
    }
  `,
    ],
})
export class FieldRendererComponent {
    @Input({ required: true }) fields: FieldDef[] = [];
}
