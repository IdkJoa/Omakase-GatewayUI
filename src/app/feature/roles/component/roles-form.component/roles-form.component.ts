import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { RolesService } from '../../services/roles.service';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MessageService, SharedModule } from 'primeng/api';
import { Role } from '../../interfaces/roles.interface';
import { InputText } from 'primeng/inputtext';
import { Textarea} from 'primeng/textarea';
import { Button } from "primeng/button";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-roles-form',
  imports: [Dialog, Textarea, InputText, ɵInternalFormsSharedModule, ReactiveFormsModule, Button, SharedModule],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.css',
})
export class RolesFormComponent {
  private readonly services = inject(RolesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly msg = inject(MessageService);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  saved = output<void>();
  data = input<Role | null>(null);

  get isEditing(): boolean {
    return this.data() !== null;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Editar Rol' : 'Crear Rol';
  }

  FormRole = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: ["", [Validators.maxLength(200)]]
  })

  onShow(): void {
    const data = this.data();
    if(!data){
      this.FormRole.reset();
      this.FormRole.markAllAsTouched();
    }else{
      this.FormRole.patchValue({
        name: data.name,
        description: data.description || ''
      })
    }
  }

  save(): void {
    if(this.FormRole.invalid){
      this.FormRole.markAllAsTouched();
      return;
    }

    const role = {
      name: this.FormRole.value.name!,
      description: this.FormRole.value.description || undefined
    };

    if(!this.isEditing){
      this.services.createRole(role)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.msg.add({
              severity: "success",
              summary: "Creado",
              detail: "Rol creado con éxito"
            });
            this.saved.emit();
            this.close();
          },
          error: (err) => {
            this.msg.add({
              severity: "error",
              summary: "Error",
              detail: err.error?.message || "Error al crear el rol"
            });
          }
        });
    } else {
      // De acuerdo a las APIs, la edición se maneja recreando o no está soportada (el backend tiene POST y DELETE).
      // Si la API no soporta PUT, podemos informar o desactivar el edit. Para robustez de la UI, mostramos info
      // ya que la historia solo exige crear (AUDITOR) y asignar.
      this.msg.add({
        severity: "info",
        summary: "Info",
        detail: "La edición de roles no está soportada por el backend en este Sprint. Recree el rol si es necesario."
      });
      this.close();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.FormRole.reset();
  }
}
