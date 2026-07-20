import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RiskConfigurationService } from '../../services/risk-configuration.service';
import { RiskConfigurationRequest, RiskConfigurationResponse } from '../../interfaces/risk-configuration.interface';

@Component({
  selector: 'app-risk-configuration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Toast,
    Button,
    Divider,
    DatePipe,
    DecimalPipe,
  ],
  providers: [MessageService],
  templateUrl: './risk-configuration.component.html',
  styleUrl: './risk-configuration.component.css',
})
export class RiskConfigurationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RiskConfigurationService);
  private readonly msg = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly loading = signal<boolean>(true);
  public readonly saving = signal<boolean>(false);
  public readonly configData = signal<RiskConfigurationResponse | null>(null);

  public riskForm: FormGroup = this.fb.group({
    policyWeight: [0.6, [Validators.required, Validators.min(0), Validators.max(1)]],
    anomalyWeight: [0.4, [Validators.required, Validators.min(0), Validators.max(1)]],
    coldStartPenalty: [30, [Validators.required, Validators.min(0)]],
    coldStartN: [10, [Validators.required, Validators.min(0)]],
    blockThreshold: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
    challengeThreshold: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading.set(true);
    this.service
      .getRiskConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.configData.set(data);
          this.riskForm.patchValue({
            policyWeight: data.policyWeight,
            anomalyWeight: data.anomalyWeight,
            coldStartPenalty: data.coldStartPenalty,
            coldStartN: data.coldStartN,
            blockThreshold: data.blockThreshold,
            challengeThreshold: data.challengeThreshold,
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al cargar la configuración de riesgo.',
          });
        },
      });
  }

  saveConfig(): void {
    if (this.riskForm.invalid) {
      this.riskForm.markAllAsTouched();
      this.msg.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Por favor, revise los campos e intente de nuevo.',
      });
      return;
    }

    const payload: RiskConfigurationRequest = {
      policyWeight: Number(this.riskForm.value.policyWeight),
      anomalyWeight: Number(this.riskForm.value.anomalyWeight),
      coldStartPenalty: Number(this.riskForm.value.coldStartPenalty),
      coldStartN: Number(this.riskForm.value.coldStartN),
      blockThreshold: Number(this.riskForm.value.blockThreshold),
      challengeThreshold: Number(this.riskForm.value.challengeThreshold),
    };

    this.saving.set(true);
    this.service
      .updateRiskConfig(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.configData.set(res);
          this.msg.add({
            severity: 'success',
            summary: 'Configuración guardada',
            detail: 'La configuración de riesgo se ha actualizado correctamente.',
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: err?.error?.message || 'Error al actualizar la configuración.',
          });
        },
      });
  }

  resetForm(): void {
    const data = this.configData();
    if (data) {
      this.riskForm.patchValue({
        policyWeight: data.policyWeight,
        anomalyWeight: data.anomalyWeight,
        coldStartPenalty: data.coldStartPenalty,
        coldStartN: data.coldStartN,
        blockThreshold: data.blockThreshold,
        challengeThreshold: data.challengeThreshold,
      });
      this.msg.add({
        severity: 'info',
        summary: 'Restablecido',
        detail: 'Los valores han sido devueltos a la configuración actual.',
      });
    }
  }
}
