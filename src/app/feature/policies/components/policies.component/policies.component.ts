import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Button } from 'primeng/button';
import { PoliciesService } from '../../services/Policies-services';
import { Policies } from '../../interfaces/policies.interface';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { Policies_Columns } from '../../data/data';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatagridPoliciesComponent } from '../datagrid-policies.component/datagrid-policies.component';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { PoliciesFormComponent } from "../policies-form.component/policies-form.component";

@Component({
  selector: 'app-policies.component',
  imports: [Divider, Toast, ConfirmDialog, Button, DatagridPoliciesComponent, PoliciesFormComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css',
})
export class PoliciesComponent implements OnInit {
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly services = inject(PoliciesService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly data = signal<Policies[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly loading = signal<boolean>(true);
  public readonly params = signal<paramsGrid | null | undefined>(undefined);
  public readonly column: Column[] = Policies_Columns;
  public readonly showActionDialog = signal<boolean>(false);
  public readonly selectedPolicy = signal<Policies | null>(null);
  public readonly isEditMode = computed(() => this.selectedPolicy() !== null);

  OnParamsGrid(params: paramsGrid | null | undefined): void {
    this.params.set(params);
    if (params) {
      this.LoadPolicies();
    }
  }

  buttonsOptions: buttonOptions[] = [
    {
      icon: 'pi pi-trash text-red-400 opacity-80',
      action: (policies: Policies) => this.openDelete(policies),
    },
    {
      icon: 'pi pi-pencil  text-blue-400 opacity-80',
      action: (policies: Policies) => this.openEdit(policies),
    },
  ];

  ngOnInit(): void {
    this.LoadPolicies();
  }

  LoadPolicies() {
    this.loading.set(true);
    this.services
      .LoadPolicies(this.params() ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.totalRecords.set(response.totalRecords);
          this.data.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar Politicas',
          });
        },
      });
  }

  openEdit(policies: Policies) {
    this.selectedPolicy.set(policies);
    this.showActionDialog.set(true);
  }

  openCreate(){
    this.selectedPolicy.set(null);
    this.showActionDialog.set(true);
  }

  openDelete(policies: Policies): void {
    this.confirmation.confirm({
      message: `¿Estas seguro de eliminar la politica ${policies.name}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle text-amber-400!',

      accept: () => {
        this.services.DeletePolicies(policies.id).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Politica eliminada con exito',
            });
            this.LoadPolicies();
          },
          error: () => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la politica',
            });
          },
        });
      },
    });
  }

  onPolicysaved(): void {
    this.LoadPolicies();
  }

  getActiveRecord() {
    const active = 0;
    const inactives = 0;
  }

  public activePolicies = computed(() => this.data().filter(p => p.isActive).length);
  public inactivePolicies = computed(() => this.data().filter(p => !p.isActive).length);
}
