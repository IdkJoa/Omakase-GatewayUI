import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { RolesService } from '../../services/roles.services';
import { FormBuilder,  ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MessageService, SharedModule } from 'primeng/api';
import { RoleAction, RolesResponse } from '../../interfaces/roles.interface';
import { InputText } from 'primeng/inputtext';
import { Textarea} from 'primeng/textarea';
import { Button } from "primeng/button";
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
  data = input<RolesResponse | null>(null);

   get isEditing(): boolean {
    return this.data() !== null;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Editar Role' : 'Crear Role';
  }

  FormRole = this.fb.group({
    name: ["", [Validators.required,Validators.minLength(3)]],
    description: ["", [Validators.required, Validators.minLength(5)]]
  })

  onShow(): void {
    const data = this.data();
    if(!data){
      this.FormRole.reset();
      this.FormRole.markAllAsTouched();
    }else{
      this.FormRole.patchValue({
        name: data.name,
        description: data.description
      })
    }
  }

  save(): void {
    if(this.FormRole.invalid){
      this.FormRole.markAllAsTouched();
      return;
    }

    const role = this.FormRole.value as RoleAction;

    if(!this.isEditing){
      this.msg.add({
        severity: "success",
        summary: "Creado",
        detail: "Role creado con exito"
      });
      this.close();
    }else{
      this.msg.add({
        severity: "success",
        summary: "Actualizado",
        detail: "Role actualizado con exito"
      });
      this.close();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.FormRole.reset();
  }
}
