import { Component } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-menu-option-footer',
  imports: [Dialog],
  templateUrl: './menu-option-footer.component.html',
  styleUrl: './menu-option-footer.component.css',
})
export class MenuOptionFooterComponent {
  visible: boolean = false;

  constructor(private authService: AuthService) {}

  Logout() {
    this.authService.logout();
  }
}
