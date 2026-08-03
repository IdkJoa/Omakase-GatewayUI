import { Component, computed, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { SevicesCardComponent } from '../sevicesCard.component/sevicesCard.component';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { FormsModule } from '@angular/forms';
import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { Services } from '../../interfaces/services-protected.interface';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { Services_Columns } from '../../data/services.data';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatagridComponent } from '../../../../shared/components/datagrid.component/datagrid.component';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ServicesformComponent } from '../servicesform.component/servicesform.component';
import { ServicePolicyDialogComponent } from '../service-policy-dialog/service-policy-dialog.component';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../../shared/auth/auth.service';

@Component({
  selector: 'app-services-inventory.component',
  standalone: true,
  imports: [
    Divider,
    Toast,
    SevicesCardComponent,
    Button,
    Tooltip,
    DatagridComponent,
    ConfirmDialog,
    ServicesformComponent,
    ServicePolicyDialogComponent,
    PopoverModule,
    FormsModule, 
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './services-inventory.component.html',
  styleUrl: './services-inventory.component.css',
})
export class ServicesInventoryComponent {
  public readonly authService = inject(AuthService);
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly services = inject(ServiceProtectedService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(DatagridComponent) datagrid?: DatagridComponent;

  public readonly data = signal<Services[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly params = signal<paramsGrid | null | undefined>(undefined);
  public readonly column: Column[] = Services_Columns;
  public readonly showActionDialog = signal<boolean>(false);
  public readonly showPolicyDialog = signal<boolean>(false);
  public readonly selectedServices = signal<Services | null>(null);
  public readonly totalRecords = signal<number>(0);
  public readonly isEditMode = computed(() => this.selectedServices() !== null);

  public readonly typeSelected = signal<string>('');

  public readonly filterParams = computed(() => {
    const p: Record<string, any> = {};
    if (this.typeSelected() !== '') {
      p['isActive'] = this.typeSelected() === 'true';
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

  FormattedStatus(bool: boolean, col: string) {
    if (col === 'status') {
      return bool ? 'Activo' : 'Inactivo';
    }
    return bool ? 'Requerido' : 'No requerido';
  }

  OnparamsGrid(params: paramsGrid | null | undefined): void {
    this.params.set(params);
    if (params) {
      this.loadServices();
    }
  }

  buttonsOptions: buttonOptions[] = [
    {
      icon: 'pi pi-shield text-purple-400 opacity-90',
      action: (services: Services) => this.openPolicies(services),
      tooltip: 'Gestionar Políticas de Acceso',
    },
    {
      icon: 'pi pi-pencil text-blue-400 opacity-80',
      action: (services: Services) => this.openEdit(services),
      tooltip: 'Editar servicio',
    },
    {
      icon: 'pi pi-trash text-red-400 opacity-80',
      action: (services: Services) => this.openDelete(services),
      tooltip: 'Eliminar servicio',
    },
  ];

  loadServices() {
    this.loading.set(true);
    this.services
      .loadServices(this.params() ?? undefined)
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
            detail: err.error?.message || 'Error al cargar los servicios',
          });
        },
      });
  }

  openCreate() {
    this.selectedServices.set(null);
    this.showActionDialog.set(true);
  }

  openEdit(services: Services) {
    this.selectedServices.set(services);
    this.showActionDialog.set(true);
  }

  openPolicies(services: Services) {
    this.selectedServices.set(services);
    this.showPolicyDialog.set(true);
  }

  openDelete(services: Services) {
    this.confirmation.confirm({
      message: `¿Estas seguro de eliminar el servicio ${services.name}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle text-amber-400!',

      accept: () => {
        this.services.deleteServices(services.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Servicio eliminado con exito',
            });
            this.loadServices();
          },
          error: () => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el servicio',
            });
          },
        });
      },
    });
  }

  onserviceSaved(): void {
    this.loadServices();
  }
}
