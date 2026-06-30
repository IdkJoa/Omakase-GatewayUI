import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-roles',
  imports: [Divider,Toast],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent {
  private msg = inject(MessageService);
  private confirmation = inject(ConfirmationService);
}
