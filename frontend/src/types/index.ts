export interface InsuranceClaim {
  index: number;
  PatientID: number;
  age: number | null;
  gender: string;
  bmi: number;
  bloodpressure: number;
  diabetic: boolean;
  children: number;
  smoker: boolean;
  region: string;
  claim: number;
}

export interface ColumnMetadata {
  name: string;
  type: 'number' | 'string' | 'boolean';
  nullable: boolean;
}

export interface ParsedDataset {
  data: InsuranceClaim[];
  metadata: ColumnMetadata[];
  rowCount: number;
}

export interface KPIData {
  totalClaimsValue: number;
  averageClaimAmount: number;
  totalPatients: number;
  averageSmokerClaim: number;
  averageNonSmokerClaim: number;
}
