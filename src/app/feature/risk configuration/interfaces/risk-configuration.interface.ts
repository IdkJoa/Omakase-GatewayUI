export interface RiskConfigurationResponse {
  id: string;
  policyWeight: number;
  anomalyWeight: number;
  coldStartPenalty: number;
  coldStartN: number;
  blockThreshold: number;
  challengeThreshold: number;
  updatedAt: string;
}

export interface RiskConfigurationRequest {
  policyWeight: number;
  anomalyWeight: number;
  coldStartPenalty: number;
  coldStartN: number;
  blockThreshold: number;
  challengeThreshold: number;
}
