
export const FinanceEngine = {
  // 1. RUNWAY & BURN RATE
  calcRunway: (balance: number, monthlyBurn: number) => {
    if (monthlyBurn === 0) return Infinity;
    return (balance / monthlyBurn).toFixed(1); // Months
  },

  // 2. SAVINGS RATE
  calcSavingsRate: (income: number, expenses: number) => {
    if (income === 0) return 0;
    return ((income - expenses) / income) * 100;
  },

  // 3. STATISTICAL OUTLIER DETECTION (Z-Score)
  detectOutliers: (amounts: number[]) => {
    if (amounts.length < 5) return [];
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / amounts.length);
    return { mean, stdDev, threshold: mean + (2 * stdDev) }; // 2 Standard Deviations
  },

  // 4. LINEAR REGRESSION (For Trend Predictions)
  calcTrendSlope: (dataPoints: number[]) => {
    // Simple Least Squares Regression
    const n = dataPoints.length;
    if (n === 0) return 0;
    const x = Array.from({ length: n }, (_, i) => i); // [0, 1, 2...]
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = dataPoints.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, i) => a + dataPoints[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope; // Positive = Spending Increasing, Negative = Decreasing
  }
};