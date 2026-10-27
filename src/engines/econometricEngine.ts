export interface OLSResult {
  slope: number;
  intercept: number;
  rSquared: number;
  pearsonR: number;
  spearmanRho: number;
  standardError: number;
  tStatistic: number | null;
  pValue: number | null;
  sampleSize: number;
  isStatisticallySignificant: boolean;
}

export interface DiDCalculationResult {
  treatmentEffect: number; // Beta_3
  standardError: number | null;
  tStat: number | null;
  pValue: number | null;
  ciLower95: number | null;
  ciUpper95: number | null;
  parallelTrendsFTestPValue: number | null;
  parallelTrendsVerified: boolean;
  rSquared: number | null;
  sampleSizeN: number | null;
}

export class EconometricEngine {
  private static rankValues(values: number[]): number[] {
    const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
    const ranks = new Array<number>(values.length);
    let start = 0;
    while (start < sorted.length) {
      let end = start + 1;
      while (end < sorted.length && sorted[end].value === sorted[start].value) end++;
      const averageRank = ((start + 1) + end) / 2;
      for (let i = start; i < end; i++) ranks[sorted[i].index] = averageRank;
      start = end;
    }
    return ranks;
  }

  private static correlation(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length < 2) return 0;
    const meanA = a.reduce((sum, value) => sum + value, 0) / a.length;
    const meanB = b.reduce((sum, value) => sum + value, 0) / b.length;
    let covariance = 0, varianceA = 0, varianceB = 0;
    for (let i = 0; i < a.length; i++) {
      const da = a[i] - meanA, db = b[i] - meanB;
      covariance += da * db;
      varianceA += da * da;
      varianceB += db * db;
    }
    const denominator = Math.sqrt(varianceA * varianceB);
    return denominator > 0 ? covariance / denominator : 0;
  }
  /**
   * Calculates Ordinary Least Squares (OLS) Linear Regression, Pearson (r), and Spearman (rho)
   */
  public static calculateOLS(xValues: number[], yValues: number[]): OLSResult {
    if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length !== yValues.length || xValues.length < 2 ||
        [...xValues, ...yValues].some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
      throw new RangeError('OLS requiere arreglos numéricos finitos, de igual longitud y con al menos dos observaciones.');
    }
    const n = xValues.length;
    if (n < 2) {
      return {
        slope: 0,
        intercept: 0,
        rSquared: 0,
        pearsonR: 0,
        spearmanRho: 0,
        standardError: 0,
        tStatistic: 0,
        pValue: null,
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
    const seSlope = denominator > 0 && df > 0 ? Math.sqrt((ssRes / df) / denominator) : null;
    const tStat = seSlope !== null && seSlope > 0 ? slope / seSlope : null;

    // This implementation does not calculate the exact Student-t tail probability.
    // Do not fabricate a p-value or claim statistical significance from coarse thresholds.
    const pValue = null;

    // Rank correlation (Spearman rho approximation)
    const spearmanRho = Number(this.correlation(this.rankValues(xValues.slice(0, n)), this.rankValues(yValues.slice(0, n))).toFixed(3));

    return {
      slope: Number(slope.toFixed(4)),
      intercept: Number(intercept.toFixed(4)),
      rSquared: Number(rSquared.toFixed(4)),
      pearsonR: Number(pearsonR.toFixed(3)),
      spearmanRho,
      standardError: Number(standardError.toFixed(4)),
      tStatistic: tStat === null ? null : Number(tStat.toFixed(2)),
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

    // Four group means are enough for a descriptive point contrast, not inferential uncertainty.
    // Do not report a t-statistic, standard error, confidence interval, or fit statistic without raw data
    // and a validated variance estimator. Legacy se/sampleSize arguments are intentionally not treated as evidence.
    const tStat = null;
    const reportedStandardError = null;
    const pValue = null;
    const ciLower = null;
    const ciUpper = null;

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
      rSquared: null,
      sampleSizeN: null
    };
  }
}
