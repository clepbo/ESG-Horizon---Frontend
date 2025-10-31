export interface GeneralTargetData {
  reductionPercentage: number | null;
  baselineYear: number | null;
  targetYear: number | null;
  description: string;
  targetEmission: number | null;
  totalReduction: number | null;
}

export type TargetType = 'general' | 'scope';