import { Component, computed, inject } from '@angular/core';
import { routes } from '../../interfaces/routes';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-menu-options',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-options.component.html',
  styleUrl: './menu-options.component.css',
})
export class MenuOptionsComponent {
  private readonly authService = inject(AuthService);

  public readonly routes = computed(() => {
    return routes.filter((r) => {
      if (r.roles && r.roles.length > 0) {
        return r.roles.some((role) => this.authService.hasRole(role));
      }
      return true;
    });
  });
}
