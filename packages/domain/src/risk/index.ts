export interface RiskScoreResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  violations: string[];
  reasons: string[];
}
