import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { PoliciesService } from '../../services/Policies-services';
import { Policies, PoliciesAction, POLICY_TYPES, PolicyTypeOption } from '../../interfaces/policies.interface';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { MessageService, SharedModule } from 'primeng/api';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { getConditionText } from '../../../../shared/Utils/function.datagrid';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    const parsed = typeof control.value === 'object' ? control.value : JSON.parse(control.value);
    if (typeof parsed !== 'object' || parsed === null) {
      return { invalidJson: true };
    }
    return null;
  } catch {
    return { invalidJson: true };
  }
}

@Component({
  selector: 'app-policies-form',
  imports: [Dialog, InputNumber, ReactiveFormsModule, InputText, Select, Textarea, Button, SharedModule],
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

  readonly policyTypeOptions: PolicyTypeOption[] = POLICY_TYPES;

  readonly defaultConfigs: Record<string, string> = {
    Geofence: JSON.stringify({ allowedCountries: ['DO', 'US'], denied_countries: ['RU', 'CN'] }, null, 2),
    Timewindow: JSON.stringify({ startHour: 8, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] }, null, 2),
    Fingerprint: JSON.stringify({ maxDevicesPerSession: 3 }, null, 2),
    impossibleTravel: JSON.stringify({ maxSpeedKmh: 800 }, null, 2),
  };

  get isEditing(): boolean {
    return this.PolicyData() !== null;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Editar Politica' : 'Crear Politica';
  }

  FormPolicy = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['Geofence', [Validators.required]],
    config: ['', [Validators.required, jsonValidator]],
    weight: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
  });

  getConditionText = getConditionText;

  onShow(): void {
    const data = this.PolicyData();
    console.log(data);
    if (!data) {
      this.FormPolicy.reset({
        name: '',
        type: 'Geofence',
        config: this.defaultConfigs['Geofence'],
        weight: 0,
        isActive: true,
      });
      this.FormPolicy.markAllAsTouched();
    } else {
      let configString = '';
      if (data.config) {
        if (typeof data.config === 'string') {
          try {
            const parsed = JSON.parse(data.config);
            configString = JSON.stringify(parsed, null, 2);
          } catch {
            configString = data.config;
          }
        } else {
          configString = JSON.stringify(data.config, null, 2);
        }
      }

      this.FormPolicy.patchValue({
        name: data.name,
        type: data.type,
        config: configString,
        weight: data.weight * 100,
        isActive: data.isActive,
      });
    }
  }

  onTypeChange(newType: string): void {
    if (!this.isEditing) {
      const defaultConfig = this.defaultConfigs[newType];
      if (defaultConfig) {
        this.FormPolicy.patchValue({ config: defaultConfig });
      }
    }
  }

  save() {
    if (this.FormPolicy.invalid) {
      this.FormPolicy.markAllAsTouched();
      return;
    }
    const formVal = this.FormPolicy.value;
    const weight = formVal.weight;

    if (weight === null || weight === undefined) return;

    let parsedConfig: any;
    try {
      parsedConfig = typeof formVal.config === 'string' ? JSON.parse(formVal.config) : formVal.config;
    } catch {
      this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La configuración debe ser un JSON válido',
      });
      return;
    }

    const peso = Math.max(0, weight > 1 ? weight / 100 : weight);

    const payload: PoliciesAction = {
      name: formVal.name!,
      type: formVal.type!,
      config: parsedConfig,
      weight: peso,
      isActive: formVal.isActive ?? true,
    };

    console.log({ payload });
    if (!this.isEditing) {
      this.service
        .CreatePolicies(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Creado',
              detail: 'Política creada con éxito',
            });
            this.saved.emit();
            this.close();
          },
          error: (err) => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Error al crear la política',
            });
          },
        });
    } else {
      const id = this.PolicyData()!.id;
      this.service
        .UpdatePolicies(payload, id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: 'Política actualizada con éxito',
            });
            this.saved.emit();
            this.close();
          },
          error: (err) => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Error al actualizar la política',
            });
          },
        });
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.FormPolicy.reset();
  }
}

