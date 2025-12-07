import { Router, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { InsuranceClaim, ParsedDataset, ColumnMetadata } from '../types/insurance';

const router = Router();
const upload: Multer = multer({ storage: multer.memoryStorage() });

const EXPECTED_COLUMNS = [
  'index',
  'PatientID',
  'age',
  'gender',
  'bmi',
  'bloodpressure',
  'diabetic',
  'children',
  'smoker',
  'region',
  'claim'
];

const BOOLEAN_COLUMNS = new Set(['diabetic', 'smoker']);
const NUMERIC_COLUMNS = new Set(['index', 'PatientID', 'age', 'bmi', 'bloodpressure', 'children', 'claim']);

function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'yes';
}

function convertToNumber(value: string, columnName: string): number | null {
  if (columnName === 'age' && value.trim() === '') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function generateColumnMetadata(): ColumnMetadata[] {
  return [
    { name: 'index', type: 'number', nullable: false },
    { name: 'PatientID', type: 'number', nullable: false },
    { name: 'age', type: 'number', nullable: true },
    { name: 'gender', type: 'string', nullable: false },
    { name: 'bmi', type: 'number', nullable: false },
    { name: 'bloodpressure', type: 'number', nullable: false },
    { name: 'diabetic', type: 'boolean', nullable: false },
    { name: 'children', type: 'number', nullable: false },
    { name: 'smoker', type: 'boolean', nullable: false },
    { name: 'region', type: 'string', nullable: true },
    { name: 'claim', type: 'number', nullable: false }
  ];
}

let cachedDataset: ParsedDataset | null = null;

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const fileStream = Readable.from([req.file.buffer]);
    const data: InsuranceClaim[] = [];
    let headers: string[] = [];

    await new Promise<void>((resolve, reject) => {
      fileStream
        .pipe(csv())
        .on('headers', (parsedHeaders: string[]) => {
          headers = parsedHeaders;
          const missingColumns = EXPECTED_COLUMNS.filter(col => !headers.includes(col));
          if (missingColumns.length > 0) {
            reject(new Error(`Missing columns: ${missingColumns.join(', ')}`));
          }
        })
        .on('data', (row: any) => {
          try {
            const claim: InsuranceClaim = {
              index: parseInt(row.index, 10),
              PatientID: parseInt(row.PatientID, 10),
              age: convertToNumber(row.age, 'age'),
              gender: row.gender.toLowerCase(),
              bmi: parseFloat(row.bmi),
              bloodpressure: parseInt(row.bloodpressure, 10),
              diabetic: parseBoolean(row.diabetic),
              children: parseInt(row.children, 10),
              smoker: parseBoolean(row.smoker),
              region: row.region || 'unknown',
              claim: parseFloat(row.claim)
            };
            data.push(claim);
          } catch (error) {
            reject(new Error(`Error parsing row: ${(error as Error).message}`));
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    cachedDataset = {
      data,
      metadata: generateColumnMetadata(),
      rowCount: data.length
    };

    res.json({
      success: true,
      dataset: cachedDataset
    });
  } catch (error) {
    res.status(400).json({
      error: `CSV parsing failed: ${(error as Error).message}`
    });
  }
});

router.get('/dataset', (req: Request, res: Response): void => {
  if (!cachedDataset) {
    res.status(404).json({ error: 'No dataset loaded. Please upload a CSV file first.' });
    return;
  }
  res.json(cachedDataset);
});

export default router;
