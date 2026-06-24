
import { Component, input, OnInit } from '@angular/core';
import { Metrics } from '../../interfaces/dashboard.interface';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-system-health',
  imports: [KnobModule, FormsModule, ChartModule],
  templateUrl: './system-health.component.html',
  styleUrl: './system-health.component.css',
})
export class SystemHealthComponent implements OnInit {
  public metrics = input.required<Metrics>();

  getRiskColor(): string {
    return 'url(#fullRiskGrad)';
  }

  getRiskLabel(): string {
    const risk = this.metrics();

    if (risk.averageRiskScore <= 40) return 'LOW RISK';
    if (risk.averageRiskScore <= 75) return 'MODERATE RISK';
    return 'CRITICAL THREAT';
  }

  //variables del chart
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    const series = this.metrics().riskScoreSeries;

    const labels = series.map(item => {
      const date = new Date(item.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    })

    const data = series.map(item => item.evaluationCount);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: "Traffic Volumen",
          data: data,
          backgroundColor: '#9d72ff',
          hoverBackgroundColor: '#9D72FF',
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        Tooltip: {
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
}
