import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { InsuranceClaim } from '../types';

interface SearchFilterProps {
  data: InsuranceClaim[];
  onFilterChange: (filtered: InsuranceClaim[]) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ data, onFilterChange }: SearchFilterProps) => {
  const [patientId, setPatientId] = useState('');
  const [region, setRegion] = useState('');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(65);
  const [smokerFilter, setSmokerFilter] = useState('all');

  const regions = Array.from(new Set(data.map(d => d.region).filter(r => r !== 'unknown')));

  const applyFilters = useCallback(() => {
    let filtered = data;

    if (patientId) {
      const id = parseInt(patientId, 10);
      filtered = filtered.filter(d => d.PatientID === id);
    }

    if (region) {
      filtered = filtered.filter(d => d.region === region);
    }

    filtered = filtered.filter(d => {
      if (d.age === null) return true;
      return d.age >= minAge && d.age <= maxAge;
    });

    if (smokerFilter === 'smokers') {
      filtered = filtered.filter(d => d.smoker);
    } else if (smokerFilter === 'non-smokers') {
      filtered = filtered.filter(d => !d.smoker);
    }

    onFilterChange(filtered);
  }, [data, patientId, region, minAge, maxAge, smokerFilter, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
  }, [patientId, region, minAge, maxAge, smokerFilter, applyFilters]);

  return (
    <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient ID
          </label>
          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Search by ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Regions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Age: {minAge}
          </label>
          <input
            type="range"
            min="18"
            max="65"
            value={minAge}
            onChange={(e) => setMinAge(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Age: {maxAge}
          </label>
          <input
            type="range"
            min="18"
            max="65"
            value={maxAge}
            onChange={(e) => setMaxAge(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Smoker Status
          </label>
          <select
            value={smokerFilter}
            onChange={(e) => setSmokerFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="smokers">Smokers Only</option>
            <option value="non-smokers">Non-Smokers Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};
