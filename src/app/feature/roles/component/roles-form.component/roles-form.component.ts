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
import { HttpErrorResponse } from '@angular/common/http';

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
          error: (err: HttpErrorResponse) => {
            this.msg.add({
              severity: "error",
              summary: "Error",
              detail: err.error?.message || "Error al crear el rol"
            });
          }
        });
    } else {
      const id = this.data()!.id;
      this.services.updateRole(id, role)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.msg.add({
              severity: "success",
              summary: "Actualizado",
              detail: "Rol actualizado con éxito"
            });
            this.saved.emit();
            this.close();
          },
          error: (err: HttpErrorResponse) => {
            this.msg.add({
              severity: "error",
              summary: "Error",
              detail: err.error?.message || "Error al actualizar el rol"
            });
          }
        });
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.FormRole.reset();
  }
}
