import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ServicesResponse } from '../../interfaces/services-protected.interface';
import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sevices-card',
  imports: [],
  templateUrl: './sevicesCard.component.html',
  styleUrl: './sevicesCard.component.css',
})
export class SevicesCardComponent {
  private readonly msg = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ServiceProtectedService);
  public readonly data = signal<ServicesResponse | null>(null);
  public readonly loading = signal<boolean>(false);

  public readonly ServicesActive =  computed(() => {
    const services = this.data()?.data;

    if(!services)return;

    return services.filter(s => s.isActive === true).length;
  });

  public readonly ServicesInactive =  computed(() => {
    const services = this.data()?.data;

    if(!services)return;

    return services.filter(s => s.isActive === false).length;
  });

  constructor() {
    this.loadServices();
  }

  loadServices(){
    const params: paramsGrid = {
      page: 1,
      pageSize: 200
    }
    this.loading.set(true);
    this.service.LoadServices(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
        this.msg.add({
          severity: "success",
          summary: "Exito",
          detail: "data consultada correctamente"
        });
      }, error: () => {
        this.msg.add({
          severity: "error",
          summary: "Error",
          detail: "Ha ocurrido un error al traer la data",
        })
      }
    });
  }
}
