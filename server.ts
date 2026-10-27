import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { timingSafeEqual } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '256kb' }));

// Protected API routes fail closed unless a server-side bearer secret is configured.
// Never send FULGOR_API_KEY to browser code.
function requireConfiguredBearer(req: express.Request, res: express.Response, next: express.NextFunction) {
  const configuredKey = process.env.FULGOR_API_KEY;
  if (!configuredKey || configuredKey.length < 32) {
    return res.status(503).json({ error: 'Servicio API no disponible: falta configurar un secreto de servidor válido.' });
  }
  const authorization = req.headers.authorization || '';
  const suppliedKey = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const supplied = Buffer.from(suppliedKey);
  const expected = Buffer.from(configuredKey);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ error: 'Autenticación requerida.' });
  }
  next();
}

// Protect legacy endpoints too: they can trigger model costs or return computed outputs.
// The public demo UI must not embed the secret; use a trusted server-side session/proxy for live access.
app.use('/api/copilot', requireConfiguredBearer);
app.use('/api/digital-twin', requireConfiguredBearer);
app.use('/api/causal', requireConfiguredBearer);

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FULGOR IA ANALICER ECONOMIC API',
    timestamp: new Date().toISOString(),
    version: '1.0.0-PRO',
  });
});

// 2. AI Economic Copilot Endpoint
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { prompt, contextCountry, activeSector } = req.body;

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) {
      return res.status(400).json({ error: 'Prompt requerido; debe contener entre 1 y 8000 caracteres.' });
    }
    if ((contextCountry !== undefined && (typeof contextCountry !== 'string' || contextCountry.length > 120)) ||
        (activeSector !== undefined && (typeof activeSector !== 'string' || activeSector.length > 120))) {
      return res.status(400).json({ error: 'Los campos de contexto deben ser texto de hasta 120 caracteres.' });
    }

    const ai = getGenAI();
    
    // System instruction strictly upholding the epistemic rules & Fulgor Economic Philosophy
    const systemInstruction = `Eres FULGOR IA ANALICER ECONOMIC COPILOT, el asistente de inteligencia macroeconómica y econometría avanzada del ecosistema Fulgor IA.
Propósito: Convertir datos económicos en inteligencia comprensible para tomar mejores decisiones.
Filosofía: Medir. Analizar. Comprender. Anticipar.
Regla de oro: "Datos reales, metodología transparente, conclusiones responsables."

DIRECTIVAS CRÍTICAS DE RIGOR CIENTÍFICO:
1. DISTINCIÓN EPISTÉMICA OBLIGATORIA: En cada respuesta debes clasificar tus aseveraciones:
   - [DATO OBSERVADO / FACTUAL]: Datos verificados con fuente y fecha (p.ej. INEGI, FRED, Eurostat, Banco Mundial, OCDE).
   - [CORRELACIÓN ESTADÍSTICA]: Asociación numérica (menciona coeficiente r o significancia) recordando que correlación NO implica causalidad.
   - [ESTIMACIÓN MODELADA]: Resultados de modelos econométricos (parámetros Beta, R², supuestos).
   - [POSIBLE INFERENCIA CAUSAL]: Métodos formales (Difference-in-Differences, controles sintéticos, variables instrumentales), explicitando supuestos y test de tendencias paralelas.
   - [PRONÓSTICO PROBABILÍSTICO]: Proyecciones a futuro con horizonte, escenarios (base, conservador, optimista) y recordatorio de que no son certezas.
2. NUNCA inventes datos, estadísticas ni atribuciones causales no fundamentadas. Si faltan datos para un país o sector específico, indícalo con transparencia.
3. Cita fuentes verificables (INEGI, BEA, Eurostat, OCDE, FMI, Banco Mundial, CEPAL).
4. Explica con claridad matemática pero en un tono profesional, objetivo, sobrio y analítico.`;

    let assistantResponseText = '';
    let sourcesCited: string[] = [];
    let epistemicLevel = 'La clasificación epistémica no verifica automáticamente las fuentes';

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Contexto País: ${contextCountry || 'General / Global'}
Sector activo: ${activeSector || 'Multisectorial'}

Consulta del analista:
${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.3, // Low temperature for high analytical rigor and precision
        }
      });
      assistantResponseText = response.text || 'Sin respuesta del modelo.';
    } else {
      // Fail closed epistemically: no fabricated statistics when the AI provider is unavailable.
      assistantResponseText = '### MODO SIN DATOS VERIFICADOS\n\nEl servicio de análisis no está configurado. No se generaron cifras, correlaciones, efectos causales ni pronósticos. Configura GEMINI_API_KEY o proporciona datos verificables para continuar.';
      sourcesCited = [];
      epistemicLevel = 'No verificado — proveedor no disponible';
    }

    res.json({
      reply: assistantResponseText,
      sourcesCited,
      epistemicLevel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/copilot/chat:', error);
    res.status(500).json({
      error: 'Error al procesar el análisis económico en el Copilot.',
      details: 'Revisa los registros del servidor; no se exponen detalles internos al cliente.',
    });
  }
});

// 3. Economic Digital Twin Simulation Endpoint
app.post('/api/digital-twin/simulate', (req, res) => {
  try {
    const {
      aiAdoptionDelta = 25,
      rdIncentivePercentage = 15,
      automationCapitalElasticity = 0.35,
      laborUpskillingSpeed = 3,
      tradeTechOpenness = 75,
      regulatoryFriction = 30,
      baseGDP = 1845.2,
    } = req.body ?? {};

    const numericInputs = { aiAdoptionDelta, rdIncentivePercentage, automationCapitalElasticity, laborUpskillingSpeed, tradeTechOpenness, regulatoryFriction, baseGDP };
    if (Object.values(numericInputs).some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
      return res.status(400).json({ error: 'Todos los parámetros deben ser números finitos.' });
    }
    if (aiAdoptionDelta < 0 || aiAdoptionDelta > 100 ||
        rdIncentivePercentage < 0 || rdIncentivePercentage > 100 ||
        automationCapitalElasticity < 0 || automationCapitalElasticity > 2 ||
        laborUpskillingSpeed < 0 || laborUpskillingSpeed > 10 ||
        tradeTechOpenness < 0 || tradeTechOpenness > 100 ||
        regulatoryFriction < 0 || regulatoryFriction > 100 ||
        baseGDP <= 0 || baseGDP > 1_000_000) {
      return res.status(400).json({ error: 'Uno o más parámetros están fuera de los rangos permitidos.' });
    }

    const delta = aiAdoptionDelta;
    const rd = rdIncentivePercentage;
    const elast = automationCapitalElasticity;
    const upskilling = laborUpskillingSpeed;
    const openness = tradeTechOpenness;
    const friction = regulatoryFriction;

    // Structural Economic Simulation Model (Cobb-Douglas augmented with Total Factor Productivity dividend)
    // TFP_lift = alpha * ln(1 + delta/100) * (openness/100) * (1 - friction/200) + (rd * 0.02)
    const tfpLiftAnnual = Number(((elast * 2.8 * Math.log(1 + delta / 100) * (openness / 80) * (1 - friction / 250) + (rd * 0.015))).toFixed(2));
    const gdpGrowthBonusCumulative = Number((tfpLiftAnnual * 1.65 + (upskilling * 0.3)).toFixed(2));
    const netEmploymentBalance = Number(((upskilling * 1.2) - (elast * delta * 0.08) + (openness * 0.02)).toFixed(2));
    const realWageLiftAnnual = Number(((tfpLiftAnnual * 0.65) + (upskilling * 0.25) - (friction * 0.01)).toFixed(2));
    const fiscalLift = Number(((baseGDP * (gdpGrowthBonusCumulative / 100) * 0.22)).toFixed(2));

    const currentYear = 2026;
    const trajectory = [];
    let cumulativeSimGDP = baseGDP;
    let cumulativeBaseGDP = baseGDP;
    let baselineAnnualGrowth = 0.022; // 2.2%

    for (let yr = 0; yr <= 4; yr++) {
      const year = currentYear + yr;
      if (yr === 0) {
        trajectory.push({
          year,
          baselineGDP: Number(baseGDP.toFixed(1)),
          simulatedGDP: Number(baseGDP.toFixed(1)),
          productivityIndex: 100.0,
          aiAdoptionRate: Number((24.8 + (delta * 0.2)).toFixed(1)),
          highSkillJobsK: 1240,
          routineJobsK: 4800,
          realWageIndex: 100.0
        });
      } else {
        cumulativeBaseGDP *= (1 + baselineAnnualGrowth);
        const simGrowth = baselineAnnualGrowth + (tfpLiftAnnual / 100 * (yr / 3));
        cumulativeSimGDP *= (1 + simGrowth);
        
        trajectory.push({
          year,
          baselineGDP: Number(cumulativeBaseGDP.toFixed(1)),
          simulatedGDP: Number(cumulativeSimGDP.toFixed(1)),
          productivityIndex: Number((100 + (tfpLiftAnnual * yr * 3.2)).toFixed(1)),
          aiAdoptionRate: Number((24.8 + (delta * (yr / 4))).toFixed(1)),
          highSkillJobsK: Math.round(1240 + (yr * 140 * (upskilling / 3))),
          routineJobsK: Math.round(4800 - (yr * 85 * (elast / 0.35)) + (yr * 35)),
          realWageIndex: Number((100 + (realWageLiftAnnual * yr)).toFixed(1))
        });
      }
    }

    res.json({
      scenarioName: `Simulación Digital Twin (+${delta}% Adopción IA, I+D: ${rd}%)`,
      summary: {
        gdpExtraGrowthCumulative: gdpGrowthBonusCumulative,
        productivityAnnualLift: tfpLiftAnnual,
        netEmploymentBalance,
        fiscalRevenueLiftBillion: fiscalLift,
        realWageGrowthAnnual: realWageLiftAnnual,
        inflationaryPressureImpact: Number((-(tfpLiftAnnual * 0.18)).toFixed(2)), // Deflacionario por mayor eficiencia
      },
      yearlyTrajectory: trajectory,
      uncertaintyScore: Math.min(85, Math.max(20, Math.round(30 + (delta * 0.6) + (friction * 0.4)))),
      assumptionsStated: [
        'Modelo basado en función de producción Cobb-Douglas expandida con spillovers de productividad digital.',
        'Se asume transmisión salarial con un retardo de 6 a 12 meses respecto a las ganancias de productividad.',
        'Coste de re-entrenamiento (upskilling) absorbido de forma mixta (50% público con incentivos fiscales, 50% privado).',
        'Elasticidades ilustrativas; no existe calibración empírica validada en esta simulación.'
      ],
      riskFactors: [
        { risk: 'Rigidez regulatoria o barreras de interoperabilidad', severity: friction > 40 ? 'ALTA' : 'MEDIA', probability: 'NO ESTIMADA' },
        { risk: 'Brecha de competencias de talento especializado', severity: upskilling < 3 ? 'ALTA' : 'BAJA', probability: 'NO ESTIMADA' },
        { risk: 'Concentración de mercado en proveedores de infraestructura tecnológica', severity: 'MEDIA', probability: 'NO ESTIMADA' }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'No fue posible ejecutar la simulación.' });
  }
});

// 4. Causal Difference-in-Differences Calculation API
app.post('/api/causal/did-analysis', (req, res) => {
  const { preTreatmentDiff = 0.2, postTreatmentDiff = 21.6, standardError = 2.76 } = req.body ?? {};
  if ([preTreatmentDiff, postTreatmentDiff, standardError].some((value) => typeof value !== 'number' || !Number.isFinite(value)) ||
      standardError <= 0) {
    return res.status(400).json({ error: 'Las diferencias deben ser números finitos y el error estándar debe ser positivo.' });
  }
  const treatmentEffect = postTreatmentDiff - preTreatmentDiff;
  const pValue = null;
  const ciLower = null;
  const ciUpper = null;

  res.json({
    method: 'Difference-in-Differences (DiD)',
    treatmentEffect: Number(treatmentEffect.toFixed(2)),
    confidenceInterval95: null,
    standardError: null,
    tStatistic: null,
    pValue,
    isStatisticallySignificant: false,
    epistemicStatus: 'EXPLORATORIO — no se calculó un p-valor inferencial válido',
    notes: 'Requiere verificación estricta de tendencias paralelas pre-tratamiento.'
  });
});

// ==========================================
// VERSIONED API (v1 / v2) - Enterprise REST
// ==========================================

app.use('/api/v1', (req, res, next) => {
  if (req.path === '/health') return next();
  const configuredKey = process.env.FULGOR_API_KEY;
  if (!configuredKey || configuredKey.length < 32) {
    return res.status(503).json({ error: 'API protegida no disponible: configura un FULGOR_API_KEY de al menos 32 caracteres en el servidor.' });
  }
  const authorization = req.headers.authorization || '';
  const suppliedKey = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!suppliedKey || suppliedKey.length !== configuredKey.length ||
      !timingSafeEqual(Buffer.from(suppliedKey), Buffer.from(configuredKey))) {
    return res.status(401).json({ error: 'Autenticación requerida.' });
  }
  next();
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v1.0.0-PRO',
    service: 'FULGOR IA ANALICER ECONOMIC REST API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/indicators', (req, res) => {
  res.json({
    version: 'v1',
    epistemicStandard: 'Rule of Gold — provenance not yet independently verified',
    dataStatus: 'DEMO_DATA_NOT_VERIFIED',
    count: 12,
    timestamp: new Date().toISOString(),
    indicators: [
      { code: 'MX_GDP_Q', name: 'PIB Trimestral México', country: 'México', value: 2.1, unit: '% YoY', epistemicType: 'MODEL_ESTIMATE', source: 'INEGI' },
      { code: 'MX_CPI_YOY', name: 'Inflación General Anual INPC', country: 'México', value: 4.42, unit: '% YoY', epistemicType: 'DEMO_NOT_VERIFIED', source: 'INEGI / Banxico (fuente por verificar)' },
      { code: 'US_GDP_Q', name: 'US Real GDP Growth Rate', country: 'Estados Unidos', value: 2.8, unit: '% Annualized', epistemicType: 'DEMO_NOT_VERIFIED', source: 'BEA / FRED (fuente por verificar)' },
      { code: 'US_CPI_CORE', name: 'US Core CPI', country: 'Estados Unidos', value: 3.1, unit: '% YoY', epistemicType: 'DEMO_NOT_VERIFIED', source: 'BLS / FRED (fuente por verificar)' },
      { code: 'DE_GDP_Q', name: 'PIB Alemania Real Growth', country: 'Alemania', value: 0.4, unit: '% YoY', epistemicType: 'DEMO_NOT_VERIFIED', source: 'Destatis / Eurostat (fuente por verificar)' },
      { code: 'BR_GDP_Q', name: 'PIB Brasil Crescimento', country: 'Brasil', value: 2.9, unit: '% YoY', epistemicType: 'DEMO_NOT_VERIFIED', source: 'IBGE / BCB (fuente por verificar)' }
    ]
  });
});

app.get('/api/v1/countries', (req, res) => {
  res.json({
    version: 'v1',
    dataStatus: 'DEMO_DATA_NOT_VERIFIED',
    epistemicWarning: 'Las cifras y puntuaciones de esta respuesta son datos ilustrativos no verificados; no usar para decisiones económicas.',
    count: 7,
    countries: [
      { id: 'MX', name: 'México', region: 'LATAM', gdpNominalBillionUSD: 1845.2, faiiIndexScore: 68.4, aiAdoptionRate: 24.8 },
      { id: 'US', name: 'Estados Unidos', region: 'Norteamérica', gdpNominalBillionUSD: 28780.0, faiiIndexScore: 92.6, aiAdoptionRate: 51.2 },
      { id: 'DE', name: 'Alemania', region: 'Europa', gdpNominalBillionUSD: 4450.0, faiiIndexScore: 84.1, aiAdoptionRate: 43.5 },
      { id: 'BR', name: 'Brasil', region: 'LATAM', gdpNominalBillionUSD: 2180.0, faiiIndexScore: 64.7, aiAdoptionRate: 21.6 },
      { id: 'ES', name: 'España', region: 'Europa', gdpNominalBillionUSD: 1580.0, faiiIndexScore: 71.9, aiAdoptionRate: 31.4 },
      { id: 'CO', name: 'Colombia', region: 'LATAM', gdpNominalBillionUSD: 360.0, faiiIndexScore: 59.2, aiAdoptionRate: 18.9 },
      { id: 'CL', name: 'Chile', region: 'LATAM', gdpNominalBillionUSD: 335.0, faiiIndexScore: 73.5, aiAdoptionRate: 27.4 }
    ]
  });
});

app.post('/api/v1/simulate', (req, res) => {
  const { aiAdoptionDelta = 25, rdIncentivePercentage = 15 } = req.body;
  res.json({
    version: 'v1',
    status: 'illustrative_simulation_only',
    dataStatus: 'DEMO_MODEL_NOT_CALIBRATED',
    epistemicWarning: 'Resultados generados por fórmulas ilustrativas no calibradas con datos reales; no son pronósticos ni estimaciones económicas validadas.',
    scenario: `Digital Twin (+${aiAdoptionDelta}% AI, +${rdIncentivePercentage}% R&D)`
    gdpBonusPct: Number((aiAdoptionDelta * 0.074).toFixed(2)),
    productivityLiftAnnual: Number((aiAdoptionDelta * 0.052).toFixed(2)),
    epistemicType: 'PROJECTION',
    uncertaintyBand: 'No calibrado — no interpretar como intervalo de confianza'
  });
});

app.post('/api/v1/correlation', (req, res) => {
  try {
    const { x = [1, 2, 3, 4, 5], y = [2.1, 3.9, 6.2, 8.1, 9.8] } = req.body ?? {};
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2 || x.length > 10000 ||
        [...x, ...y].some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
      return res.status(400).json({ error: 'x e y deben ser arreglos numéricos finitos del mismo tamaño (2 a 10000 pares).' });
    }
    const n = x.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i]; sumY += y[i]; sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i]; sumY2 += y[i] * y[i];
    }
    const meanX = sumX / n, meanY = sumY / n;
    const denom = sumX2 - (sumX * sumX) / n;
    const slope = denom !== 0 ? (sumXY - (sumX * sumY) / n) / denom : 0;
    const intercept = meanY - slope * meanX;
    
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      const pred = slope * x[i] + intercept;
      ssTot += Math.pow(y[i] - meanY, 2);
      ssRes += Math.pow(y[i] - pred, 2);
    }
    const rSquared = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;
    const pearsonR = (slope >= 0 ? 1 : -1) * Math.sqrt(rSquared);

    res.json({
      version: 'v1',
      epistemicType: 'CORRELATION',
      slope: Number(slope.toFixed(4)),
      intercept: Number(intercept.toFixed(4)),
      rSquared: Number(rSquared.toFixed(4)),
      pearsonR: Number(pearsonR.toFixed(3)),
      sampleSize: n,
      pValue: null,
      isStatisticallySignificant: false,
      inferenceStatus: 'DESCRIPTIVE_ONLY — p-value not calculated',
      ruleOfGoldCaveat: 'Correlación no implica causalidad.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'No fue posible procesar el cálculo solicitado.' });
  }
});

app.post('/api/v1/did', (req, res) => {
  try {
    const { preTreat = 0.2, postTreat = 21.6, preControl = 0.1, postControl = 0.2, se = 2.45 } = req.body ?? {};
    if ([preTreat, postTreat, preControl, postControl, se].some((value) => typeof value !== 'number' || !Number.isFinite(value)) || se <= 0) {
      return res.status(400).json({ error: 'Los valores DiD deben ser números finitos y el error estándar debe ser positivo.' });
    }
    const effect = (postTreat - preTreat) - (postControl - preControl);
    const tStat = effect / se;
    const pValue = null;
    
    res.json({
      version: 'v1',
      epistemicType: 'CAUSAL_INFERENCE',
      methodology: 'Difference-in-Differences (DiD) 2x2',
      treatmentEffect: Number(effect.toFixed(2)),
      confidenceInterval95: null,
      tStatistic: null,
      standardError: null,
      pValue,
      parallelTrendsVerified: false,
      parallelTrendsPValue: null,
      inferenceStatus: 'EXPLORATORY_ONLY — parallel trends not tested',
      isStatisticallySignificant: false
    });
  } catch (err: any) {
    res.status(500).json({ error: 'No fue posible procesar el cálculo solicitado.' });
  }
});

app.get('/api/v1/forecasts', (req, res) => {
  const parsedBaseValue = req.query.baseValue === undefined ? 2.4 : Number(req.query.baseValue);
  if (!Number.isFinite(parsedBaseValue)) {
    return res.status(400).json({ error: 'baseValue debe ser un número finito.' });
  }
  const baseValue = parsedBaseValue;
  res.json({
    version: 'v1',
    epistemicType: 'ILLUSTRATIVE_DEMO_ONLY',
    dataStatus: 'DEMO_MODEL_NOT_CALIBRATED',
    epistemicWarning: 'Valores ilustrativos; no proceden de una serie económica verificada ni de un modelo probabilístico calibrado. No son pronósticos reales.',
    horizon: '8 Trimestres (2026-2028)',
    model: 'Fan Chart Probabilístico Estocástico',
    centralP50: baseValue,
    p10LowerTail: Number((baseValue - 1.25).toFixed(2)),
    p90UpperTail: Number((baseValue + 1.45).toFixed(2)),
    volatilitySigma: 0.015,
    epistemicWarning: 'Los pronósticos no son garantías; cono de incertidumbre expansivo.'
  });
});

app.get('/api/v1/anomalies', (req, res) => {
  res.json({
    version: 'v1',
    activeAlerts: [],
    dataStatus: 'NO_LIVE_ALERTS_CONNECTED'
  });
});

app.get('/api/v1/faii', (req, res) => {
  res.json({
    version: 'v1',
    indexName: 'Fulgor AI Impact Index (FAII)',
    epistemicType: 'ILLUSTRATIVE_DEMO_ONLY',
    dataStatus: 'DEMO_INDEX_NOT_VALIDATED',
    epistemicWarning: 'Este ranking es una maqueta ilustrativa, no un índice calculado con metodología validada ni fuentes verificadas.',
    rankings: [
      { rank: 1, country: 'Estados Unidos', score: 92.6, tier: 'LÍDER GLOBAL' },
      { rank: 2, country: 'Alemania', score: 84.1, tier: 'ALTA CAPACIDAD' },
      { rank: 3, country: 'Chile', score: 73.5, tier: 'LÍDER REGIONAL' },
      { rank: 4, country: 'España', score: 71.9, tier: 'AVANZADO' },
      { rank: 5, country: 'México', score: 68.4, tier: 'CRECIMIENTO ACELERADO' },
      { rank: 6, country: 'Brasil', score: 64.7, tier: 'POTENCIAL ESTRUCTURAL' },
      { rank: 7, country: 'Colombia', score: 59.2, tier: 'EN DESARROLLO' }
    ]
  });
});

app.get('/api/v1/system-audit', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v1.0.0-PRO',
    auditResult: 'NOT READY FOR RELEASE',
    gatesPassed: 'No verificado — auditoría automatizada y evidencia externa pendientes',
    timestamp: new Date().toISOString(),
    ruleOfGoldActive: true,
    epistemicChecks: 'No verificado en ejecución; requiere pruebas independientes'
  });
});


app.get('/api/v1/observability', (req, res) => {
  res.json({
    status: 'DEGRADED',
    uptimeSeconds: Math.floor(process.uptime()),
    apiLatencyMs: null,
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    activeConnections: null,
    errorRate: null,
    geminiAiReady: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v2/preview', (req, res) => {
  res.json({
    version: 'v2-draft',
    status: 'contract_preview_active',
    features: ['High-frequency orderflow econometric stream', 'Synthetic control multi-node agent mesh'],
    releaseTarget: '2026-Q4'
  });
});

// Serve frontend with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FULGOR IA ANALICER ECONOMIC server running on http://localhost:${PORT}`);
  });
}

startServer();
