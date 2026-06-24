import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Logs_Data } from '../../../audit forense/interface/logs.interfaces';

@Component({
  selector: 'app-table-log',
  imports: [TableModule],
  templateUrl: './table_log.component.html',
  styleUrl: './table_log.component.css',
})
export class TableLogComponent {
  public logs = input.required<Logs_Data[]>();

  getVerdictStyle(verdict: string): string {
    switch (verdict?.toUpperCase()) {
      case 'ALLOW':
        return 'text-[#10B981]  ';

      case 'BLOCK':
        return 'text-[#EF4444]  ';

      case 'CHALLENGE':
        return 'text-[#F59E0B] ';

      default:
        return 'text-gray-400  ';
    }
  }
}
