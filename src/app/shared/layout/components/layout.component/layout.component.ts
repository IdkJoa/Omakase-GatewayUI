import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { MenuOptionsComponent } from "../menu-options.component/menu-options.component";

@Component({
  selector: 'app-layout.component',
  imports: [RouterOutlet, MenuOptionsComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export default class LayoutComponent {
}
