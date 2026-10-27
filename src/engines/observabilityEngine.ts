export interface SystemHealthMetrics {
  serverStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  apiLatencyMs: number;
  memoryUsageMb: number;
  errorRatePercentage: number;
  activeSessions: number;
  geminiModelReady: boolean;
  provenanceVerificationRate: number;
  lastHealthCheck: string;
}

export class ObservabilityEngine {
  private static startTime: number = Date.now();

  public static getSystemHealth(): SystemHealthMetrics {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      serverStatus: 'DEGRADED',
      uptimeSeconds: uptimeSec,
      apiLatencyMs: 0,
      memoryUsageMb: 0,
      errorRatePercentage: 0,
      activeSessions: 0,
      geminiModelReady: Boolean((typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)),
      provenanceVerificationRate: 0,
      lastHealthCheck: new Date().toISOString(),
    };
  }

  public static getAuditLogs(): { id: string; timestamp: string; level: 'INFO' | 'WARN' | 'SECURITY'; event: string; actor: string }[] {
    return [
      { id: 'LOG-DEMO-01', timestamp: new Date().toLocaleTimeString(), level: 'WARN', event: 'Los registros mostrados son demostrativos; no existe una fuente de eventos de producción conectada.', actor: 'ObservabilityEngine' }
    ];
  }
}
