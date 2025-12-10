import { Router, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { DataRow, ParsedDataset, ColumnMetadata } from '../types/insurance';

const router = Router();
const upload: Multer = multer({ storage: multer.memoryStorage() });

function detectFileType(filename: string): 'csv' | 'json' | 'tsv' {
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.tsv')) return 'tsv';
  return 'csv';
}

function inferColumnTypes(data: DataRow[], columns: string[]): ColumnMetadata[] {
  return columns.map(col => {
    const samples = data.slice(0, 100).map(row => row[col]);
    const nonNullSamples = samples.filter(v => v !== null && v !== undefined && v !== '');

    let type: 'string' | 'number' | 'boolean' | 'mixed' = 'string';
    let hasNumbers = 0;
    let hasBooleans = 0;
    let hasStrings = 0;

    nonNullSamples.forEach(val => {
      const strVal = String(val).toLowerCase().trim();
      if (strVal === 'true' || strVal === 'false' || strVal === 'yes' || strVal === 'no') {
        hasBooleans++;
      } else if (!isNaN(parseFloat(strVal)) && isFinite(Number(strVal))) {
        hasNumbers++;
      } else {
        hasStrings++;
      }
    });

    if (hasBooleans > nonNullSamples.length * 0.8) {
      type = 'boolean';
    } else if (hasNumbers > nonNullSamples.length * 0.8) {
      type = 'number';
    } else if (hasStrings > nonNullSamples.length * 0.8) {
      type = 'string';
    } else {
      type = 'mixed';
    }

    const nullable = samples.some(v => v === null || v === undefined || v === '');
    return { name: col, type, nullable };
  });
}
let cachedDataset: ParsedDataset | null = null;

async function parseCSV(buffer: Buffer): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const fileStream = Readable.from([buffer]);
    const data: DataRow[] = [];

    fileStream
      .pipe(csv())
      .on('data', (row: DataRow) => {
        data.push(row);
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

async function parseTSV(buffer: Buffer): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const fileStream = Readable.from([buffer]);
    const data: DataRow[] = [];

    fileStream
      .pipe(csv({ separator: '\t' }))
      .on('data', (row: DataRow) => {
        data.push(row);
      })
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

function parseJSON(buffer: Buffer): DataRow[] {
  const text = buffer.toString('utf-8');
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed)) {
    return parsed.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item as DataRow;
      }
      return { value: item } as DataRow;
    });
  } else if (typeof parsed === 'object' && parsed !== null) {
    return Object.entries(parsed).map(([key, value]) => ({
      key,
      value: value as string | number | boolean | null
    }));
  }

  throw new Error('Invalid JSON format. Expected array or object.');
}

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const fileType = detectFileType(req.file.originalname);
    let data: DataRow[] = [];

    if (fileType === 'json') {
      data = parseJSON(req.file.buffer);
    } else if (fileType === 'tsv') {
      data = await parseTSV(req.file.buffer);
    } else {
      data = await parseCSV(req.file.buffer);
    }

    if (data.length === 0) {
      res.status(400).json({ error: 'File is empty or contains no valid data' });
      return;
    }

    const columns = Object.keys(data[0]);
    const metadata = inferColumnTypes(data, columns);

    cachedDataset = {
      data,
      metadata,
      rowCount: data.length,
      columns
    };

    res.json({
      success: true,
      dataset: cachedDataset
    });
  } catch (error) {
    res.status(400).json({
      error: `File parsing failed: ${(error as Error).message}`
    });
  }
});

router.get('/dataset', (req: Request, res: Response): void => {
  if (!cachedDataset) {
    res.status(404).json({ error: 'No dataset loaded. Please upload a file first.' });
    return;
  }
  res.json(cachedDataset);
});

export default router;
