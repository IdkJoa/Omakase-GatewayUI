import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Services, ServicesAction } from '../../interfaces/services-protected.interface';
import { Dialog } from "primeng/dialog";
import { InputText } from "primeng/inputtext";
import { CheckboxModule } from 'primeng/checkbox';
import { Button } from "primeng/button";

@Component({
  selector: 'app-servicesform',
  imports: [Dialog, CheckboxModule, ReactiveFormsModule, FormsModule, InputText, Button],
  templateUrl: './servicesform.component.html',
  styleUrl: './servicesform.component.css',
})
export class ServicesformComponent {
  private readonly service = inject(ServiceProtectedService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly msg = inject(MessageService);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  saved = output<void>();
  ServicesData = input<Services | null>(null);

  get isEditing(): boolean {
    return this.ServicesData() !== null;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Editar Servicio' : 'Crear Servicio';
  }

  FormService = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(3)]],
    upstreamUrl: ["", [Validators.required, Validators.minLength(10)]],
    requiresAuth: [false],
    isActive: [false],
  })

  onShow(): void {
    const data = this.ServicesData();

    if(!data) {
      this.FormService.reset();
      this.FormService.markAllAsTouched();
    }else{
      this.FormService.patchValue({
        name: data.name,
        upstreamUrl: data.upstreamUrl,
        requiresAuth: data.requiresAuth,
        isActive: data.isActive,
      });
    }
  }

  save() {
      if(this.FormService.invalid){
        this.FormService.markAllAsTouched();
        return;
      }
      const policy = this.FormService.value as ServicesAction;
      if (!this.isEditing) {
        this.msg.add({
          severity: 'success',
          summary: 'Creado',
          detail: 'Servicio creado con exito',
        });
        this.close();
      } else {
        this.msg.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Servicio actualizado con exito',
        });
        this.close();
      }
    }

    close(): void {
      this.visibleChange.emit(false);
      this.FormService.reset();
    }
}
