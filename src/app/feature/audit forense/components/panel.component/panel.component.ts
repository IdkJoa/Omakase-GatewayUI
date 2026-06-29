import { Component, input, model, output } from '@angular/core';
import { Logs_Data } from '../../interface/logs.interfaces';
import { DrawerModule } from 'primeng/drawer';
import { DatePipe } from '@angular/common';
import { getVerdictColor, getRiskColor } from '../../../../shared/Utils/function.datagrid';

@Component({
  selector: 'app-panel',
  imports: [DrawerModule, DatePipe],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent {
  public logSelected = input.required<Logs_Data | null>();
  public drawerVisible = model.required<boolean>();
  public panelClosed = output<void>();

  getVerdictColor = getVerdictColor;
  getRiskColor = getRiskColor;

  onVisebleChange(estado: boolean) {
    setTimeout(() => {
      this.drawerVisible.set(estado);

      if (!estado) {
        this.panelClosed.emit();
      }
    }, 0);
  }

  public cerrarDetalles() {
    this.onVisebleChange(false);
  }
}
