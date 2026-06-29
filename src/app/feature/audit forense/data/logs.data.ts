import { Column } from "../../../shared/layout/interfaces/Columns";

export const logs_Columns: Column[] = [
  { name: "TIMESTAMP", field: "timestamp", type: "Date" },
  { name: "SOURCE IDENTITY", field: "sourceIp", type: "string" },
  { name: "Resource Destination", field: "serviceName", type: "string" },
  { name: "Verdict", field: "verdict", type: "string" },
  { name: "Risk Score", field: "riskScore", type: "string[]" },
];

export const filter_logs: string[] = ["timestamp", "sourceIp", "serviceName", "verdict", "triggeredRules"];
