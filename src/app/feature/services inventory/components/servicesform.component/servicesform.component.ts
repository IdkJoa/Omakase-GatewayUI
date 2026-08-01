import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Services, ServicesAction } from '../../interfaces/services-protected.interface';
import { Dialog } from "primeng/dialog";
import { InputText } from "primeng/inputtext";
import { CheckboxModule } from 'primeng/checkbox';
import { Button } from "primeng/button";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
      this.FormService.reset({
        requiresAuth: false,
        isActive: false
      });
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
      const services = this.FormService.value as ServicesAction;
      if (!this.isEditing) {
        this.service.createServices(services).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
           next: () => {
              this.msg.add({
                severity: 'success',
                summary: 'Creado',
                detail: 'Servicio creado con éxito',
              });
              this.saved.emit();
              this.close();
            },
            error: (err) => {
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.message || 'Error al crear el servicio',
              });
            },
          });
      } else {
        const id = this.ServicesData()!.id;
        this.service.updateServices(services, id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.msg.add({
                severity: 'success',
                summary: 'Actualizado',
                detail: 'Servicio actualizado con éxito',
              });
              this.saved.emit();
              this.close();
            },
            error: (err) => {
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.message || 'Error al actualizar el servicio',
              });
            },
          });
      }
    }

    close(): void {
      this.visibleChange.emit(false);
      this.FormService.reset();
    }
}
