import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-services-inventory.component',
  imports: [Divider, Toast],
  providers: [MessageService, ConfirmationService],
  templateUrl: './services-inventory.component.html',
  styleUrl: './services-inventory.component.css',
})
export class ServicesInventoryComponent {
  private msg = inject(MessageService);
  private confirmation = inject(ConfirmationService);
}
