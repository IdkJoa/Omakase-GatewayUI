export interface Metrics {
  totalEvaluations: number;
  allowedCount: number;
  challengedCount: number;
  blockedCount: number;
  allowedPercent: number;
  challengedPercent: number;
  blockedPercent: number;
  averageRiskScore: number;
  uniqueUsers: number;
  riskScoreSeries: RiskScoreSery[];
}

export interface RiskScoreSery {
  timestamp: Date;
  avgScore: number;
  evaluationCount: number;
}
