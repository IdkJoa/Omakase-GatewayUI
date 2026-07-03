import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { PoliciesService } from '../../services/Policies-services';
import { Policies, PoliciesAction } from '../../interfaces/policies.interface';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { MessageService, SharedModule } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { getConditionText } from '../../../../shared/Utils/function.datagrid';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-policies-form',
  imports: [Dialog, InputNumber, ReactiveFormsModule, Toast, InputText, Button, SharedModule],
  templateUrl: './policies-form.component.html',
  styleUrls: ['./policies-form.component.css'],
})
export class PoliciesFormComponent {
  private readonly service = inject(PoliciesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly msg = inject(MessageService);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  saved = output<void>();
  PolicyData = input<Policies | null>(null);

  get isEditing(): boolean {
    return this.PolicyData() !== null;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Editar Politica' : 'Crear Politica';
  }

  FormPolicy = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['', [Validators.required, Validators.minLength(3)]],
    config: ['', [Validators.required, Validators.minLength(3)]],
    weight: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
  });

  getConditionText = getConditionText;

  onShow(): void {
    const data = this.PolicyData();
    console.log(data);
    if (!data) {
      this.FormPolicy.reset();
      this.FormPolicy.markAllAsTouched();
    } else {
      this.FormPolicy.patchValue({
        name: data.name,
        type: data.type,
        config: getConditionText(data),
        weight: data.weight,
        isActive: data.isActive,
      });
    }
  }

  save() {
    if(this.FormPolicy.invalid){
      this.FormPolicy.markAllAsTouched();
      return;
    }
    const policy = this.FormPolicy.value as PoliciesAction;
    if (!this.isEditing) {
      this.msg.add({
        severity: 'success',
        summary: 'Creado',
        detail: 'Politica creada con exito',
      });
      this.close();
    } else {
      this.msg.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Politica actualizada con exito',
      });
      this.close();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.FormPolicy.reset();
  }
}
