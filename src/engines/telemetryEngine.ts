import { FulgorProductImpact, EcosystemModuleMetric } from '../types/economic';
import { FULGOR_ECOSYSTEM_PRODUCTS, ECOSYSTEM_MODULES } from '../data/economicData';

export class TelemetryEngine {
  public static getProducts(): FulgorProductImpact[] {
    return FULGOR_ECOSYSTEM_PRODUCTS;
  }

  public static getTelemetryMetrics(): EcosystemModuleMetric[] {
    return ECOSYSTEM_MODULES;
  }

  public static getAggregatedImpact() {
    // Static ecosystem fixtures are not production telemetry or verified impact measurements.
    return {
      totalHoursSavedHours: null,
      totalCostSavingsUSD: null,
      averageProductivityLiftPct: null,
      totalTasksProcessed: null,
      anonymizedDeployments: null,
      dataStatus: 'DEMO_ESTIMATES_NOT_VERIFIED',
      complianceStandard: 'No se ha verificado una certificación ISO/IEC 27701 ni una auditoría GDPR en tiempo de ejecución'
    };
  }
}
