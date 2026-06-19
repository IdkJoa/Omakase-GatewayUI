import { Component } from '@angular/core';
import { routes } from '../../interfaces/routes';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-options.component.html',
  styleUrl: './menu-options.component.css',
})
export class MenuOptionsComponent {
  routes = routes;
}
