export interface ApiEndpointDoc {
  method: 'GET' | 'POST';
  path: string;
  version: 'v1' | 'v2';
  description: string;
  authRequired: boolean;
  requiredTier: 'FREE' | 'PRO' | 'PRO_MAX' | 'ENTERPRISE';
  sampleRequestBody?: any;
  sampleResponse?: any;
}

export class ApiEngine {
  // API credentials must be configured and validated server-side; never embed them in the client.
  public static getApiKey(): string {
    return '';
  }

  public static setApiKey(_key: string): void {
    // Intentionally no-op: client-side API key storage is not supported.
  }

  public static getEndpointsCatalog(): ApiEndpointDoc[] {
    return [
      {
        method: 'GET',
        path: '/api/v1/health',
        version: 'v1',
        description: 'Verifica la disponibilidad del servicio, la versión y la latencia.',
        authRequired: false,
        requiredTier: 'FREE',
        sampleResponse: {
          status: 'ok',
          service: 'FULGOR IA ANALICER ECONOMIC API',
          version: '1.0.0-PRO',
          timestamp: '2026-08-15T00:00:00.000Z'
        }
      },
      {
        method: 'GET',
        path: '/api/v1/indicators',
        version: 'v1',
        description: 'Obtiene un catálogo demostrativo de indicadores; no hay fuentes en vivo verificadas.',
        authRequired: true,
        requiredTier: 'FREE',
        sampleResponse: {
          dataStatus: 'DEMO_RESPONSE_NOT_REAL',
          count: 12,
          indicators: [
            { code: 'MX_GDP_Q', name: 'PIB Trimestral México', currentValue: 2.1, unit: '% YoY', epistemicType: 'OBSERVED_DATA' }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/v1/countries',
        version: 'v1',
        description: 'Perfiles y puntuaciones ilustrativos; no validados con fuentes reales.',
        authRequired: true,
        requiredTier: 'FREE',
        sampleResponse: {
          dataStatus: 'DEMO_RESPONSE_NOT_REAL',
          countries: [{ id: 'MX', name: 'México', faiiIndexScore: 68.4 }]
        }
      },
      {
        method: 'POST',
        path: '/api/v1/simulate',
        version: 'v1',
        description: 'Ejecuta una simulación ilustrativa no calibrada; no es un pronóstico económico validado.',
        authRequired: true,
        requiredTier: 'PRO',
        sampleRequestBody: {
          countryCode: 'MX',
          aiAdoptionDelta: 25,
          rdIncentivePercentage: 15,
          automationCapitalElasticity: 0.35,
          laborUpskillingSpeed: 3
        },
        sampleResponse: {
          dataStatus: 'DEMO_MODEL_NOT_CALIBRATED',
          scenarioName: 'Simulación ilustrativa Digital Twin (+25% Adopción IA)',
          gdpExtraGrowthCumulative: 1.85,
          uncertaintyScore: 38
        }
      },
      {
        method: 'POST',
        path: '/api/v1/causal',
        version: 'v1',
        description: 'Contrato de demostración; inferencia causal y pruebas de robustez no disponibles sin datos adecuados.',
        authRequired: true,
        requiredTier: 'PRO',
        sampleRequestBody: {
          preTreatmentDiff: 0.2,
          postTreatmentDiff: 21.6,
          standardError: 2.76
        },
        sampleResponse: {
          dataStatus: 'DEMO_INFERENCE_NOT_VALIDATED',
          treatmentEffect: 21.4,
          tStatistic: 7.75,
          pValue: null,
          isStatisticallySignificant: false
        }
      },
      {
        method: 'GET',
        path: '/api/v1/alerts',
        version: 'v1',
        description: 'Ejemplos ilustrativos de alertas; no hay monitor de datos en vivo.',
        authRequired: true,
        requiredTier: 'PRO_MAX',
        sampleResponse: {
          dataStatus: 'DEMO_ALERTS_NOT_LIVE',
          activeAlertsCount: 4,
          alerts: [{ id: 'ALT-01', severity: 'HIGH', impactArea: 'Inflación' }]
        }
      },
      {
        method: 'GET',
        path: '/api/v2/preview',
        version: 'v2',
        description: 'Contrato de arquitectura v2 para streaming de microestructuras de alta frecuencia (En desarrollo).',
        authRequired: true,
        requiredTier: 'ENTERPRISE',
        sampleResponse: {
          status: 'contract_draft_ready',
          nextGenStream: true
        }
      }
    ];
  }
}
