import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { Services, ServicesResponse } from '../../interfaces/services-protected.interface';
import { ServiceProtectedService } from '../../services/ServicesProtected.services';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sevices-card',
  standalone: true,
  imports: [],
  templateUrl: './sevicesCard.component.html',
  styleUrl: './sevicesCard.component.css',
})
export class SevicesCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ServiceProtectedService);

  public readonly servicesList = input<Services[]>([]);
  public readonly totalCountInput = input<number>(0);

  public readonly data = signal<ServicesResponse | null>(null);
  public readonly loading = signal<boolean>(false);

  public readonly totalServicesCount = computed(() => {
    if (this.totalCountInput() > 0) return this.totalCountInput();
    if (this.servicesList().length > 0) return this.servicesList().length;
    return this.data()?.totalRecords || 0;
  });

  public readonly ServicesActive = computed(() => {
    const list = this.servicesList().length > 0 ? this.servicesList() : this.data()?.data;
    if (!list) return 0;
    return list.filter((s) => s.isActive === true).length;
  });

  public readonly ServicesInactive = computed(() => {
    const list = this.servicesList().length > 0 ? this.servicesList() : this.data()?.data;
    if (!list) return 0;
    return list.filter((s) => s.isActive === false).length;
  });

  public readonly ServicesAuthRequired = computed(() => {
    const list = this.servicesList().length > 0 ? this.servicesList() : this.data()?.data;
    if (!list) return 0;
    return list.filter((s) => s.requiresAuth === true).length;
  });

  constructor() {
    if (this.servicesList().length === 0) {
      this.loadServices();
    }
  }

  loadServices() {
    const params: paramsGrid = {
      page: 1,
      pageSize: 200,
    };
    this.loading.set(true);
    this.service
      .LoadServices(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.data.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
