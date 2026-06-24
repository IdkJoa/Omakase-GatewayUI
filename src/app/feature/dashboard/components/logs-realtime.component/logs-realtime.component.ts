import { Component, input, linkedSignal, OnInit, signal } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Logs_Data } from '../../../audit forense/interface/logs.interfaces';

@Component({
  selector: 'app-logs-realtime',
  imports: [ScrollPanelModule],
  templateUrl: './logs-realtime.component.html',
  styleUrl: './logs-realtime.component.css',
})
export class LogsRealtimeComponent {
  public logs = input.required<Logs_Data[]>();

  livelogs = linkedSignal({
    source: this.logs,
    computation: (sourcelogs) => sourcelogs.map(log => this.mapLogData(log))
  });


  private mapLogData(log: any) {
    const date = new Date(log.timestamp);

    // Formato estricto HH:mm:ss
    const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    return {
      ...log, // Mantenemos username, sourceIp, triggeredRules, etc.
      time: timeString,
      colorClass: this.getVerdictColor(log.verdict)
    };
  }

  public simulateIncomingLog(rawLog: any) {
    const formmatedLog = this.mapLogData(rawLog);

    this.livelogs.update(currentLog => {
      const newLogsList = [formmatedLog, ...currentLog];

      return newLogsList.slice(0, 50);
    });
  }

  private getVerdictColor(verdict: string): string {
    switch (verdict.toUpperCase()) {
      case 'ALLOw':
        return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30';
      case 'BLOCK':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      case 'CHALLENGE':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  //prueba

}
