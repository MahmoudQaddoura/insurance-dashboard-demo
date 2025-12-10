"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
function detectFileType(filename) {
    if (filename.endsWith('.json'))
        return 'json';
    if (filename.endsWith('.tsv'))
        return 'tsv';
    return 'csv';
}
function inferColumnTypes(data, columns) {
    return columns.map(col => {
        const samples = data.slice(0, 100).map(row => row[col]);
        const nonNullSamples = samples.filter(v => v !== null && v !== undefined && v !== '');
        let type = 'string';
        let hasNumbers = 0;
        let hasBooleans = 0;
        let hasStrings = 0;
        nonNullSamples.forEach(val => {
            const strVal = String(val).toLowerCase().trim();
            if (strVal === 'true' || strVal === 'false' || strVal === 'yes' || strVal === 'no') {
                hasBooleans++;
            }
            else if (!isNaN(parseFloat(strVal)) && isFinite(Number(strVal))) {
                hasNumbers++;
            }
            else {
                hasStrings++;
            }
        });
        if (hasBooleans > nonNullSamples.length * 0.8) {
            type = 'boolean';
        }
        else if (hasNumbers > nonNullSamples.length * 0.8) {
            type = 'number';
        }
        else if (hasStrings > nonNullSamples.length * 0.8) {
            type = 'string';
        }
        else {
            type = 'mixed';
        }
        const nullable = samples.some(v => v === null || v === undefined || v === '');
        return { name: col, type, nullable };
    });
}
let cachedDataset = null;
async function parseCSV(buffer) {
    return new Promise((resolve, reject) => {
        const fileStream = stream_1.Readable.from([buffer]);
        const data = [];
        fileStream
            .pipe((0, csv_parser_1.default)())
            .on('data', (row) => {
            data.push(row);
        })
            .on('end', () => resolve(data))
            .on('error', reject);
    });
}
async function parseTSV(buffer) {
    return new Promise((resolve, reject) => {
        const fileStream = stream_1.Readable.from([buffer]);
        const data = [];
        fileStream
            .pipe((0, csv_parser_1.default)({ separator: '\t' }))
            .on('data', (row) => {
            data.push(row);
        })
            .on('end', () => resolve(data))
            .on('error', reject);
    });
}
function parseJSON(buffer) {
    const text = buffer.toString('utf-8');
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
        return parsed.map(item => {
            if (typeof item === 'object' && item !== null) {
                return item;
            }
            return { value: item };
        });
    }
    else if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed).map(([key, value]) => ({
            key,
            value: value
        }));
    }
    throw new Error('Invalid JSON format. Expected array or object.');
}
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }
        const fileType = detectFileType(req.file.originalname);
        let data = [];
        if (fileType === 'json') {
            data = parseJSON(req.file.buffer);
        }
        else if (fileType === 'tsv') {
            data = await parseTSV(req.file.buffer);
        }
        else {
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
    }
    catch (error) {
        res.status(400).json({
            error: `File parsing failed: ${error.message}`
        });
    }
});
router.get('/dataset', (req, res) => {
    if (!cachedDataset) {
        res.status(404).json({ error: 'No dataset loaded. Please upload a file first.' });
        return;
    }
    res.json(cachedDataset);
});
exports.default = router;
//# sourceMappingURL=upload.js.map