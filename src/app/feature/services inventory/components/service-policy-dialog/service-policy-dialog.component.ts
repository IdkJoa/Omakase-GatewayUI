import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { PoliciesService } from '../../../policies/services/Policies-services';
import { Services, ServicePolicyDto } from '../../interfaces/services-protected.interface';
import { Policies } from '../../../policies/interfaces/policies.interface';

@Component({
  selector: 'app-service-policy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    DialogModule,
    ButtonModule,
    TableModule,
    SelectModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-confirmDialog></p-confirmDialog>
    <p-dialog
      [header]="'Políticas Asociadas - ' + (service()?.name || '')"
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '750px' }"
      (onShow)="onShow()"
    >
      <div class="space-y-4 pt-2">
        <!-- Selector para asociar nueva política -->
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row items-end gap-3">
          <div class="flex-1 w-full space-y-1">
            <label class="block text-xs font-medium text-slate-300">Asociar Nueva Política</label>
            <p-select
              [options]="availablePolicies()"
              [(ngModel)]="selectedPolicyId"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccionar política de acceso..."
              styleClass="w-full p-inputtext-sm"
            ></p-select>
          </div>
          <p-button
            label="Asociar Política"
            icon="pi pi-plus"
            severity="primary"
            size="small"
            [loading]="actionLoading()"
            [disabled]="!selectedPolicyId"
            (onClick)="associatePolicy()"
          ></p-button>
        </div>

        <!-- Tabla de políticas asociadas -->
        <div class="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <p-table [value]="associatedPolicies()" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr class="bg-slate-950 text-xs uppercase text-slate-400">
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Ponderación</th>
                <th>Estado</th>
                <th class="text-center">Acción</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-policy>
              <tr class="text-sm text-slate-300">
                <td class="font-medium text-white">{{ policy.policyName }}</td>
                <td>
                  <span class="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {{ policy.policyType }}
                  </span>
                </td>
                <td class="font-mono">{{ policy.weight | number:'1.2-2' }}</td>
                <td>
                  <div class="flex flex-col gap-1">
                    @if (!policy.policyIsActive) {
                      <span class="px-2 py-0.5 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        Inactiva globalmente
                      </span>
                    } @else if (!policy.isEnabled) {
                      <span class="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Deshabilitada en servicio
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Activa
                      </span>
                    }
                  </div>
                </td>
                <td class="text-center">
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    size="small"
                    pTooltip="Desasociar política"
                    (onClick)="confirmDisassociate(policy)"
                  ></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center py-6 text-slate-500">
                  No hay políticas asociadas a este servicio.
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </p-dialog>
  `,
})
export class ServicePolicyDialogComponent {
  private readonly serviceProtectedService = inject(ServiceProtectedService);
  private readonly policiesService = inject(PoliciesService);
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  service = input<Services | null>(null);

  associatedPolicies = signal<ServicePolicyDto[]>([]);
  allPolicies = signal<Policies[]>([]);
  availablePolicies = signal<Policies[]>([]);

  selectedPolicyId: string = '';
  actionLoading = signal<boolean>(false);

  onShow(): void {
    const s = this.service();
    this.selectedPolicyId = '';
    if (s) {
      this.loadServicePolicies(s.id);
      this.loadAllPolicies();
    }
  }

  loadServicePolicies(serviceId: string): void {
    this.serviceProtectedService
      .getServicePolicies(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (policies) => {
          this.associatedPolicies.set(policies);
          this.updateAvailablePolicies();
        },
        error: (err) => {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al cargar políticas asociadas.',
          });
        },
      });
  }

  loadAllPolicies(): void {
    this.policiesService
      .loadPolicies({ page: 1, pageSize: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.allPolicies.set(res.data);
          this.updateAvailablePolicies();
        },
        error: () => {},
      });
  }

  updateAvailablePolicies(): void {
    const associatedIds = new Set(this.associatedPolicies().map((p) => p.policyId));
    const available = this.allPolicies().filter((p) => !associatedIds.has(p.id));
    this.availablePolicies.set(available);
  }

  associatePolicy(): void {
    const s = this.service();
    if (!s || !this.selectedPolicyId) return;

    this.actionLoading.set(true);
    this.serviceProtectedService
      .associatePolicy(s.id, { policyId: this.selectedPolicyId, isEnabled: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.msg.add({
            severity: 'success',
            summary: 'Política Asociada',
            detail: 'La política se asoció al servicio con éxito.',
          });
          this.selectedPolicyId = '';
          this.loadServicePolicies(s.id);
        },
        error: (err) => {
          this.actionLoading.set(false);
          if (err?.status === 409 || err?.error?.errorCode === 'CONFLICT') {
            this.msg.add({
              severity: 'warn',
              summary: 'Conflicto',
              detail: 'La política seleccionada ya está asignada a este servicio.',
            });
          } else {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al asociar la política.',
            });
          }
        },
      });
  }

  confirmDisassociate(policy: ServicePolicyDto): void {
    const s = this.service();
    if (!s) return;

    this.confirmation.confirm({
      header: 'Confirmar Desasociación',
      message: `¿Está seguro de desasociar la política "${policy.policyName}"? Dejará de aplicarse al tráfico del servicio de inmediato.`,
      icon: 'pi pi-exclamation-triangle text-amber-500',
      acceptLabel: 'Desasociar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.serviceProtectedService
          .disassociatePolicy(s.id, policy.policyId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.msg.add({
                severity: 'success',
                summary: 'Política Desasociada',
                detail: 'Se ha desvinculado la política del servicio.',
              });
              this.loadServicePolicies(s.id);
            },
            error: (err) => {
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.error?.message || 'Error al desasociar la política.',
              });
            },
          });
      },
    });
  }
}
