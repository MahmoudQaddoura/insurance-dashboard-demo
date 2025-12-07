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
function parseBoolean(value) {
    return value.toLowerCase() === 'yes';
}
function convertToNumber(value, columnName) {
    if (columnName === 'age' && value.trim() === '') {
        return null;
    }
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}
function generateColumnMetadata() {
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
let cachedDataset = null;
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }
        const fileStream = stream_1.Readable.from([req.file.buffer]);
        const data = [];
        let headers = [];
        await new Promise((resolve, reject) => {
            fileStream
                .pipe((0, csv_parser_1.default)())
                .on('headers', (parsedHeaders) => {
                headers = parsedHeaders;
                const missingColumns = EXPECTED_COLUMNS.filter(col => !headers.includes(col));
                if (missingColumns.length > 0) {
                    reject(new Error(`Missing columns: ${missingColumns.join(', ')}`));
                }
            })
                .on('data', (row) => {
                try {
                    const claim = {
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
                }
                catch (error) {
                    reject(new Error(`Error parsing row: ${error.message}`));
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
    }
    catch (error) {
        res.status(400).json({
            error: `CSV parsing failed: ${error.message}`
        });
    }
});
router.get('/dataset', (req, res) => {
    if (!cachedDataset) {
        res.status(404).json({ error: 'No dataset loaded. Please upload a CSV file first.' });
        return;
    }
    res.json(cachedDataset);
});
exports.default = router;
//# sourceMappingURL=upload.js.map