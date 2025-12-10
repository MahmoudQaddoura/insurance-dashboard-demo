import * as React from 'react';
import { useState } from 'react';
import { DataRow, ColumnMetadata } from '../types';

interface MainDataGridProps {
  data: DataRow[];
  columns: string[];
  metadata: ColumnMetadata[];
}

export const MainDataGrid: React.FC<MainDataGridProps> = ({ data, columns, metadata }: MainDataGridProps) => {
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(null);
  const [sortCol, setSortCol] = useState<string>(columns[0]);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const displayCols = columns.slice(0, 2);
  const hiddenCols = columns.slice(2);

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortCol];
    const bVal = b[sortCol];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? result : -result;
  });

  const handleSort = (column: string) => {
    if (sortCol === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(column);
      setSortDir('asc');
    }
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="w-12 px-4 py-2 text-left"></th>
            {displayCols.map(col => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
              >
                {col} {sortCol === col && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            ))}
            {hiddenCols.length > 0 && <th className="px-4 py-2 text-left font-semibold text-gray-700">More</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <React.Fragment key={idx}>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="px-4 py-2">
                  <button
                    onClick={() => setExpandedRowIdx(expandedRowIdx === idx ? null : idx)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {expandedRowIdx === idx ? '−' : '+'}
                  </button>
                </td>
                {displayCols.map(col => (
                  <td key={col} className="px-4 py-2">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'N/A'}
                  </td>
                ))}
                {hiddenCols.length > 0 && (
                  <td className="px-4 py-2 text-gray-500 text-sm">{hiddenCols.length} more...</td>
                )}
              </tr>
              {expandedRowIdx === idx && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td colSpan={displayCols.length + 2} className="px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {columns.map(col => (
                        <div key={col}>
                          <p className="text-xs text-gray-500 font-semibold">{col}</p>
                          <p className="text-sm">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
