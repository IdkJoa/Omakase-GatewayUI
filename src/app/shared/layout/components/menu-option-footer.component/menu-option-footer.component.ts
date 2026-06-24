import { Component } from '@angular/core';
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-menu-option-footer',
  imports: [Dialog],
  templateUrl: './menu-option-footer.component.html',
  styleUrl: './menu-option-footer.component.css',
})
export class MenuOptionFooterComponent {

  visible: boolean = false;

  Logout() {
  }
}
