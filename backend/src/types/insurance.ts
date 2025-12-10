export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface ColumnMetadata {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'mixed';
  nullable: boolean;
}

export interface ParsedDataset {
  data: DataRow[];
  metadata: ColumnMetadata[];
  rowCount: number;
  columns: string[];
}
