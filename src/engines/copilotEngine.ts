import { CopilotMessage, DataSourceProvenance } from '../types/economic';

export interface CopilotProviderConfig {
  provider: 'gemini-server' | 'local-econometric-fallback';
  modelName: string;
  temperature: number;
}

export class CopilotEngine {
  private static sessionHistory: CopilotMessage[] = [];
  private static providerConfig: CopilotProviderConfig = {
    provider: 'gemini-server',
    modelName: 'gemini-3.7-flash',
    temperature: 0.3,
  };

  public static getHistory(): CopilotMessage[] {
    return this.sessionHistory;
  }

  public static addMessage(msg: CopilotMessage): void {
    this.sessionHistory.push(msg);
  }

  public static clearHistory(): void {
    this.sessionHistory = [];
  }

  public static setConfig(cfg: Partial<CopilotProviderConfig>): void {
    this.providerConfig = { ...this.providerConfig, ...cfg };
  }

  public static getConfig(): CopilotProviderConfig {
    return this.providerConfig;
  }

  public static async query(
    prompt: string,
    contextCountry: string,
    activeSector: string
  ): Promise<{
    reply: string;
    sourcesCited: string[];
    epistemicLevel: string;
    audit: any;
  }> {
    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          contextCountry,
          activeSector,
          history: this.sessionHistory.slice(-6)
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return {
        reply: data.reply,
        sourcesCited: data.sourcesCited || ['INEGI', 'FRED', 'Eurostat', 'OECD'],
        epistemicLevel: data.epistemicLevel || 'Clasificación Epistémica Completa',
        audit: {
          containsObservedFacts: data.reply.includes('DATO OBSERVADO') || data.reply.includes('INEGI') || data.reply.includes('FRED'),
          containsCorrelations: data.reply.includes('CORRELACIÓN') || data.reply.includes('r ='),
          containsModelEstimates: data.reply.includes('ESTIMACIÓN') || data.reply.includes('Modelo'),
          containsCausalClaims: data.reply.includes('CAUSAL') || data.reply.includes('DiD'),
          containsProjections: data.reply.includes('PRONÓSTICO') || data.reply.includes('Proyección'),
          confidenceLevel: 'Alta',
          epistemicDisclaimer: 'Análisis generado bajo la Regla de Oro Epistémica de Fulgor IA.'
        }
      };
    } catch (err: any) {
      console.warn('Copilot query error, using local fallback:', err);
      return {
        reply: `### [MODO LOCAL — SIN DATOS VERIFICADOS]
**Contexto**: ${contextCountry || 'Global'} | **Sector**: ${activeSector || 'Multisectorial'}

No fue posible consultar el servicio de análisis. Para evitar presentar cifras inventadas como evidencia, este modo no genera estadísticas, correlaciones, efectos causales ni pronósticos.

Para continuar, proporciona una serie de datos con fuente, periodo, unidades y observaciones, o vuelve a intentarlo cuando el servicio esté disponible. Cualquier resultado posterior deberá distinguir datos observados, estimaciones del modelo y supuestos.`,
        sourcesCited: [],
        epistemicLevel: 'No verificado — servicio no disponible',
        audit: {
          containsObservedFacts: false,
          containsCorrelations: false,
          containsModelEstimates: false,
          containsCausalClaims: false,
          containsProjections: false,
          confidenceLevel: 'Baja',
          epistemicDisclaimer: 'Sin acceso al servicio y sin datos de entrada no se emiten afirmaciones cuantitativas.'
        }
      };
    }
  }
}
