import * as React from 'react';
import { useState } from 'react';
import { InsuranceClaim } from '../types';

interface MainDataGridProps {
  data: InsuranceClaim[];
}

export const MainDataGrid: React.FC<MainDataGridProps> = ({ data }: MainDataGridProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'PatientID' | 'claim'>('PatientID');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    let aVal = sortBy === 'PatientID' ? a.PatientID : a.claim;
    let bVal = sortBy === 'PatientID' ? b.PatientID : b.claim;
    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? result : -result;
  });

  const handleSort = (column: 'PatientID' | 'claim') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="w-12 px-4 py-2 text-left"></th>
            <th
              onClick={() => handleSort('PatientID')}
              className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
            >
              Patient ID {sortBy === 'PatientID' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th
              onClick={() => handleSort('claim')}
              className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
            >
              Claim Amount {sortBy === 'claim' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Age</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Gender</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">BMI</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Smoker</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Region</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <React.Fragment key={idx}>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="px-4 py-2">
                  <button
                    onClick={() => setExpandedId(expandedId === row.PatientID ? null : row.PatientID)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {expandedId === row.PatientID ? '−' : '+'}
                  </button>
                </td>
                <td className="px-4 py-2 font-medium">{row.PatientID}</td>
                <td className="px-4 py-2">${row.claim.toFixed(2)}</td>
                <td className="px-4 py-2">{row.age !== null ? row.age : 'N/A'}</td>
                <td className="px-4 py-2 capitalize">{row.gender}</td>
                <td className="px-4 py-2">{row.bmi.toFixed(2)}</td>
                <td className="px-4 py-2">{row.smoker ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 capitalize">{row.region}</td>
              </tr>
              {expandedId === row.PatientID && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td colSpan={8} className="px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Index</p>
                        <p className="text-sm">{row.index}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Patient ID</p>
                        <p className="text-sm">{row.PatientID}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Age</p>
                        <p className="text-sm">{row.age !== null ? row.age : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Gender</p>
                        <p className="text-sm capitalize">{row.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">BMI</p>
                        <p className="text-sm">{row.bmi.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Blood Pressure</p>
                        <p className="text-sm">{row.bloodpressure}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Diabetic</p>
                        <p className="text-sm">{row.diabetic ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Children</p>
                        <p className="text-sm">{row.children}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Smoker</p>
                        <p className="text-sm">{row.smoker ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Region</p>
                        <p className="text-sm capitalize">{row.region}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Claim Amount</p>
                        <p className="text-sm font-semibold text-green-600">${row.claim.toFixed(2)}</p>
                      </div>
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
