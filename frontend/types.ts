/**
 * CrowdState AI 3-State Vector Definition
 */

export interface StateVector {
  /**
   * ρ (Rho): Physical Density
   * Represents the number of people per square meter.
   */
  rho: number;

  /**
   * Σ (Sigma): Sensory Load
   * Represents the acoustic and visual environmental pressure.
   */
  sigma: number;

  /**
   * Δ (Delta): Volatility
   * Represents the rate of change and unpredictability in the crowd state.
   */
  delta: number;
}

export interface CrowdStateRecord {
  timestamp: string;
  location_id: string;
  vector: StateVector;
  prediction?: {
    horizon_minutes: number;
    vector: StateVector;
  };
}
