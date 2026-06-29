
import { Component, input, effect, computed } from '@angular/core';
import { Metrics } from '../../interfaces/dashboard.interface';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { Skeleton } from 'primeng/skeleton';
import { Logs_Data } from '../../../audit forense/interface/logs.interfaces';

@Component({
  selector: 'app-system-health',
  imports: [KnobModule, FormsModule, ChartModule, Skeleton],
  templateUrl: './system-health.component.html',
  styleUrl: './system-health.component.css',
})
export class SystemHealthComponent {
  public metrics = input<Metrics | null>(null);
  public logs = input<Logs_Data[] | null>(null);

  public chartData = computed(() => {
    const logsList = this.logs();
    if (logsList && logsList.length > 0) {
      const groups: { [time: string]: number } = {};
      logsList.forEach(log => {
        const date = new Date(log.timestamp);
        const key = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        groups[key] = (groups[key] || 0) + 1;
      });

      const sortedKeys = Object.keys(groups).sort();
      return {
        labels: sortedKeys,
        datasets: [
          {
            label: "Traffic Volume",
            data: sortedKeys.map(key => groups[key]),
            backgroundColor: '#9d72ff',
            hoverBackgroundColor: '#9D72FF',
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      };
    }

    const data = this.metrics();
    if (data && data.riskScoreSeries && data.riskScoreSeries.length > 0) {
      const series = data.riskScoreSeries;
      const labels = series.map(item => {
        const date = new Date(item.timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      });

      const datasetData = series.map(item => item.evaluationCount);
      return {
        labels: labels,
        datasets: [
          {
            label: "Traffic Volume",
            data: datasetData,
            backgroundColor: '#9d72ff',
            hoverBackgroundColor: '#9D72FF',
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      };
    }

    return null;
  });

  getRiskColor(): string {
    return 'url(#fullRiskGrad)';
  }

  getRiskLabel(): string {
    const risk = this.metrics();
    if (!risk) return '';

    if (risk.averageRiskScore <= 40) return 'LOW RISK';
    if (risk.averageRiskScore <= 75) return 'MODERATE RISK';
    return 'CRITICAL THREAT';
  }

  //variables del chart
  chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#9a96a8",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
      y: {
        display: false,
        beginAtZero: true
      }
    }
  };
}
