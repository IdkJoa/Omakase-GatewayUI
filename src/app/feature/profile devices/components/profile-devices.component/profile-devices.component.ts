import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast'

@Component({
  selector: 'app-profile-devices.component',
  imports: [Divider, Toast],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profile-devices.component.html',
  styleUrl: './profile-devices.component.css',
})
export class ProfileDevicesComponent {
  private msg = inject(MessageService);
  private confirmation = inject(ConfirmationService);
}
