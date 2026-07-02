export function getVerdictColor(verdict: string): string {
  switch (verdict.toUpperCase()) {
    case 'ALLOW':
      return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30';
    case 'BLOCK':
      return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
    case 'CHALLENGE':
      return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-[#EF4444]';
  if (score >= 40) return 'text-[#F59E0B]';
  return 'text-[#10B981]';
}

export function getColumnWidth(field: string): string {
  switch (field) {
    case 'timestamp':
      return '18%';
    case 'sourceIp':
      return '25%';
    case 'serviceName':
      return '22%';
    case 'verdict':
      return '12%';
    case 'triggeredRules':
      return '18%';
    default:
      return 'auto';
  }
}
