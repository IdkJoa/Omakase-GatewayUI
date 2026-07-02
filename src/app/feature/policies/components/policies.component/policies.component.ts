import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { Button } from "primeng/button";
import { PoliciesService } from '../../services/Policies-services';
import { Policies } from '../../interfaces/policies.interface';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { Policies_Columns } from '../../data/data';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatagridPoliciesComponent } from "../datagrid-policies.component/datagrid-policies.component";

@Component({
  selector: 'app-policies.component',
  imports: [Divider, Toast, Button, DatagridPoliciesComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css',
})
export class PoliciesComponent implements OnInit{
  private msg = inject(MessageService);
  private confirmation = inject(ConfirmationService);
  private services = inject(PoliciesService);
  private destroyRef = inject(DestroyRef);
  public data = signal<Policies[]>([]);
  public totalRecords = signal<number>(0);
  public loading = signal<boolean>(true);
  public params = signal<paramsGrid | null | undefined>(undefined);
  public column: Column[] = Policies_Columns;

  OnParamsGrid(params: paramsGrid | null | undefined): void {
    this.params.set(params);
    if(params){
      this.getPolicies();
    }
  }

  ngOnInit(): void {
    this.getPolicies();
  }

  getPolicies() {
    this.loading.set(true);
    this.services.LoadPolicies(this.params() ?? undefined).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.totalRecords.set(response.totalRecords);
        this.data.set(response.data);
        this.loading.set(false)
      },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar Politicas',
          });
        },
    })
      }

}
