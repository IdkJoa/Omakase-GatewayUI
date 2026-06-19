export interface Logs {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: Logs_Data[];
  totalPages: number;
}

export interface Logs_Data {
  evaluationId: string;
  timestamp: Date;
  userId: null | string;
  username: null | string;
  serviceName: null | string;
  sourceIp: string;
  geo: Geo;
  userAgent: string;
  policyScore: number;
  anomalyScore: number;
  riskScore: number;
  verdict: string;
  triggeredRules: string[];
}

export interface Geo {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}
