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
    const metrics = ECOSYSTEM_MODULES;
    const totalHours = metrics.reduce((acc, m) => acc + m.estimatedHoursSavedTotal, 0);
    const totalSavings = metrics.reduce((acc, m) => acc + m.directCostSavingsUSD, 0);
    const avgLift = metrics.reduce((acc, m) => acc + m.measuredProductivityLiftPct, 0) / (metrics.length || 1);
    const totalTasks = metrics.reduce((acc, m) => acc + m.aggregatedTasksProcessed, 0);

    return {
      totalHoursSavedHours: totalHours,
      totalCostSavingsUSD: totalSavings,
      averageProductivityLiftPct: Number(avgLift.toFixed(1)),
      totalTasksProcessed: totalTasks,
      anonymizedDeployments: null,
      dataStatus: 'DEMO_ESTIMATES_NOT_VERIFIED',
      complianceStandard: 'No se ha verificado una certificación ISO/IEC 27701 ni una auditoría GDPR en tiempo de ejecución'
    };
  }
}
