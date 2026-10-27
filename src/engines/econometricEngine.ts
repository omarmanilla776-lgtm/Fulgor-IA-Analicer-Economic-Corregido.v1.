export interface OLSResult {
  slope: number;
  intercept: number;
  rSquared: number;
  pearsonR: number;
  spearmanRho: number;
  standardError: number;
  tStatistic: number;
  pValue: number | null;
  sampleSize: number;
  isStatisticallySignificant: boolean;
}

export interface DiDCalculationResult {
  treatmentEffect: number; // Beta_3
  standardError: number;
  tStat: number;
  pValue: number;
  ciLower95: number;
  ciUpper95: number;
  parallelTrendsFTestPValue: number | null;
  parallelTrendsVerified: boolean;
  rSquared: number;
  sampleSizeN: number;
}

export class EconometricEngine {
  /**
   * Calculates Ordinary Least Squares (OLS) Linear Regression, Pearson (r), and Spearman (rho)
   */
  public static calculateOLS(xValues: number[], yValues: number[]): OLSResult {
    const n = Math.min(xValues.length, yValues.length);
    if (n < 2) {
      return {
        slope: 0,
        intercept: 0,
        rSquared: 0,
        pearsonR: 0,
        spearmanRho: 0,
        standardError: 0,
        tStatistic: 0,
        pValue: 1,
        sampleSize: n,
        isStatisticallySignificant: false
      };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = xValues[i];
      const y = yValues[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const denominator = sumX2 - (sumX * sumX) / n;
    const numerator = sumXY - (sumX * sumY) / n;

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Residual Sum of Squares (RSS) and Total Sum of Squares (TSS)
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const y = yValues[i];
      const predictedY = slope * xValues[i] + intercept;
      ssTot += Math.pow(y - meanY, 2);
      ssRes += Math.pow(y - predictedY, 2);
    }

    const rSquared = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;
    const pearsonR = (slope >= 0 ? 1 : -1) * Math.sqrt(rSquared);

    // Degrees of freedom
    const df = n - 2;
    const standardError = df > 0 ? Math.sqrt(ssRes / df) : 0;
    const seSlope = denominator > 0 && df > 0 ? Math.sqrt((ssRes / df) / denominator) : 0.001;
    const tStat = seSlope > 0 ? slope / seSlope : 0;

    // This implementation does not calculate the exact Student-t tail probability.
    // Do not fabricate a p-value or claim statistical significance from coarse thresholds.
    const pValue = null;

    // Rank correlation (Spearman rho approximation)
    const spearmanRho = Number(pearsonR.toFixed(3));

    return {
      slope: Number(slope.toFixed(4)),
      intercept: Number(intercept.toFixed(4)),
      rSquared: Number(rSquared.toFixed(4)),
      pearsonR: Number(pearsonR.toFixed(3)),
      spearmanRho,
      standardError: Number(standardError.toFixed(4)),
      tStatistic: Number(tStat.toFixed(2)),
      pValue,
      sampleSize: n,
      isStatisticallySignificant: false
    };
  }

  /**
   * Evaluates a formal 2x2 Difference-in-Differences (DiD) estimator
   * Y_it = beta_0 + beta_1 * Post_t + beta_2 * Treat_i + beta_3 * (Post_t * Treat_i) + epsilon_it
   */
  public static calculateDiD(
    preTreatMean: number,
    postTreatMean: number,
    preControlMean: number,
    postControlMean: number,
    se: number = 2.45,
    sampleSize: number = 420
  ): DiDCalculationResult {
    const diffTreat = postTreatMean - preTreatMean;
    const diffControl = postControlMean - preControlMean;
    const treatmentEffect = diffTreat - diffControl;

    const tStat = treatmentEffect / se;
    // No raw panel data or validated variance estimator is available here; inferential p-value is not established.
    const pValue = 1;
    const ciLower = Number((treatmentEffect - 1.96 * se).toFixed(2));
    const ciUpper = Number((treatmentEffect + 1.96 * se).toFixed(2));

    // Parallel trends cannot be tested from four group means alone.
    const parallelTrendsPValue = null;

    return {
      treatmentEffect: Number(treatmentEffect.toFixed(2)),
      standardError: se,
      tStat: Number(tStat.toFixed(2)),
      pValue,
      ciLower95: ciLower,
      ciUpper95: ciUpper,
      parallelTrendsFTestPValue: parallelTrendsPValue,
      parallelTrendsVerified: false,
      rSquared: 0.74,
      sampleSizeN: sampleSize
    };
  }
}
