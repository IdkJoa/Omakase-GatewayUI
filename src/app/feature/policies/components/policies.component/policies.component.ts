import { Component, computed, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { PoliciesService } from '../../services/Policies-services';
import { Policies } from '../../interfaces/policies.interface';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { Policies_Columns } from '../../data/data';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatagridComponent } from '../../../../shared/components/datagrid.component/datagrid.component';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { PoliciesFormComponent } from '../policies-form.component/policies-form.component';
import { getConditionText } from '../../../../shared/Utils/function.datagrid';
import { AuthService } from '../../../../shared/auth/auth.service';

@Component({
  selector: 'app-policies.component',
  standalone: true,
  imports: [
    Divider,
    Toast,
    Tooltip,
    ConfirmDialog,
    Button,
    DatagridComponent,
    PoliciesFormComponent,
    PopoverModule,
    IconField,
    InputIcon,
    InputText,
    FormsModule,
    DecimalPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css',
})
export class PoliciesComponent {
  public readonly authService = inject(AuthService);
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly services = inject(PoliciesService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(DatagridComponent) datagrid?: DatagridComponent;

  public readonly data = signal<Policies[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly loading = signal<boolean>(true);
  public readonly params = signal<paramsGrid | null | undefined>(undefined);
  public readonly column: Column[] = Policies_Columns;
  public readonly showActionDialog = signal<boolean>(false);
  public readonly selectedPolicy = signal<Policies | null>(null);
  public readonly isEditMode = computed(() => this.selectedPolicy() !== null);

  public readonly typeSelected = signal<string>('');

  getConditionText = getConditionText;

  public readonly filterParams = computed(() => {
    const p: Record<string, any> = {};
    if (this.typeSelected()) {
      p['type'] = this.typeSelected();
    }
    return p;
  });

  onFilterChange() {
    this.datagrid?.onFilterChange();
  }

  limpiarFiltros() {
    this.typeSelected.set('');
    this.onFilterChange();
  }

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
      tooltip: 'Eliminar política',
    },
    {
      icon: 'pi pi-pencil text-blue-400 opacity-80',
      action: (policies: Policies) => this.openEdit(policies),
      tooltip: 'Editar política',
    },
  ];

  LoadPolicies() {
    this.loading.set(true);
    this.services
      .loadPolicies(this.params() ?? undefined)
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

  openCreate() {
    this.selectedPolicy.set(null);
    this.showActionDialog.set(true);
  }

  openDelete(policies: Policies): void {
    this.confirmation.confirm({
      message: `¿Estas seguro de eliminar la politica ${policies.name}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle text-amber-400!',

      accept: () => {
        this.services.deletePolicies(policies.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

  public activePolicies = computed(() => this.data().filter((p) => p.isActive).length);
  public inactivePolicies = computed(() => this.data().filter((p) => !p.isActive).length);
}
