import { getVerdictColor, getRiskColor, getColumnWidth, getConditionText } from './function.datagrid';
import { Policies } from '../../feature/policies/interfaces/policies.interface';

describe('function.datagrid Utils', () => {
  it('1. should return correct color class for ALLOW verdict (case insensitive)', () => {
    expect(getVerdictColor('ALLOW')).toBe('bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30');
    expect(getVerdictColor('allow')).toBe('bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30');
  });

  it('2. should return correct color class for BLOCK verdict', () => {
    expect(getVerdictColor('BLOCK')).toBe('bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30');
  });

  it('3. should return correct color class for CHALLENGE verdict', () => {
    expect(getVerdictColor('CHALLENGE')).toBe('bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30');
  });

  it('4. should return fallback gray color class for unknown verdict values', () => {
    expect(getVerdictColor('UNKNOWN')).toBe('bg-gray-500/20 text-gray-400 border-gray-500/30');
    expect(getVerdictColor('')).toBe('bg-gray-500/20 text-gray-400 border-gray-500/30');
  });

  it('5. should return red text class for risk scores >= 80', () => {
    expect(getRiskColor(80)).toBe('text-[#EF4444]');
    expect(getRiskColor(95)).toBe('text-[#EF4444]');
  });

  it('6. should return amber text class for risk scores between 40 and 79', () => {
    expect(getRiskColor(40)).toBe('text-[#F59E0B]');
    expect(getRiskColor(79)).toBe('text-[#F59E0B]');
  });

  it('7. should return green text class for risk scores < 40', () => {
    expect(getRiskColor(0)).toBe('text-[#10B981]');
    expect(getRiskColor(39)).toBe('text-[#10B981]');
  });

  it('8. should return configured widths for specific fields and default auto for others', () => {
    expect(getColumnWidth('timestamp')).toBe('18%');
    expect(getColumnWidth('sourceIp')).toBe('25%');
    expect(getColumnWidth('serviceName')).toBe('22%');
    expect(getColumnWidth('verdict')).toBe('12%');
    expect(getColumnWidth('triggeredRules')).toBe('18%');
    expect(getColumnWidth('id')).toBe('auto');
    expect(getColumnWidth('')).toBe('auto');
  });

  it('9. should generate condition text for Geofence, TimeWindow, ImpossibleTravel and Fingerprint policies', () => {
    const geofencePolicy: any = { type: 'Geofence', config: { allowedCountries: ['US', 'MX'] } };
    expect(getConditionText(geofencePolicy)).toBe('Countries: US, MX');

    const timeWindowPolicy: any = { type: 'TimeWindow', config: { startHour: 8, endHour: 18, daysOfWeek: [1, 2, 3] } };
    expect(getConditionText(timeWindowPolicy)).toBe('8:00 - 18:00 (3 days)');

    const travelPolicy: any = { type: 'ImpossibleTravel', config: { maxSpeedKmh: 900 } };
    expect(getConditionText(travelPolicy)).toBe('Max Speed: 900 km/h');

    const fingerprintPolicy: any = { type: 'Fingerprint', config: { maxDevicesPerSession: 3 } };
    expect(getConditionText(fingerprintPolicy)).toBe('Max Devices: 3');
  });

  it('10. should return "Custom Configuration" for unknown or unhandled policy types', () => {
    const customPolicy: any = { type: 'CustomType', config: {} };
    expect(getConditionText(customPolicy)).toBe('Custom Configuration');

    const unknownPolicy: any = { type: '', config: {} };
    expect(getConditionText(unknownPolicy)).toBe('Custom Configuration');
  });
});
