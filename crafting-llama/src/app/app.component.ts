import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from "@shared/layout/header/header.component";
import {FooterComponent} from "@shared/layout/footer/footer.component";
import {ToastComponent} from "@shared/ui/toast/toast.component";
import {ColorService} from "@core/catalog/color.service";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
})
export class AppComponent {

  constructor(private readonly colorService: ColorService) {}

  ngOnInit(): void {
    this.colorService.loadColorNameMapFromLocal();
  }

}
