import * as React from 'react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { InsuranceClaim } from '../types';

interface DashboardProps {
  data: InsuranceClaim[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }: DashboardProps) => {
  // Claims distribution histogram
  const getClaimsDistribution = () => {
    const bins = [
      { range: '0-1000', min: 0, max: 1000, count: 0 },
      { range: '1000-2000', min: 1000, max: 2000, count: 0 },
      { range: '2000-3000', min: 2000, max: 3000, count: 0 },
      { range: '3000-4000', min: 3000, max: 4000, count: 0 },
      { range: '4000-5000', min: 4000, max: 5000, count: 0 },
      { range: '5000+', min: 5000, max: Infinity, count: 0 }
    ];

    data.forEach(claim => {
      const bin = bins.find(b => claim.claim >= b.min && claim.claim < b.max);
      if (bin) bin.count++;
    });

    return bins;
  };

  // Claims by region
  const getClaimsByRegion = () => {
    const regionMap = new Map<string, { region: string; total: number; count: number; avg: number }>();

    data.forEach(claim => {
      const region = claim.region || 'unknown';
      if (!regionMap.has(region)) {
        regionMap.set(region, { region, total: 0, count: 0, avg: 0 });
      }
      const entry = regionMap.get(region)!;
      entry.total += claim.claim;
      entry.count++;
      entry.avg = entry.total / entry.count;
    });

    return Array.from(regionMap.values());
  };

  // Age vs claims scatter
  const getAgeVsClaims = () => {
    return data
      .filter(d => d.age !== null)
      .map(d => ({
        age: d.age as number,
        claim: d.claim,
        smoker: d.smoker ? 'Smoker' : 'Non-Smoker',
        PatientID: d.PatientID
      }))
      .sort((a, b) => a.age - b.age);
  };

  // Smoker vs non-smoker comparison
  const getSmokerComparison = () => {
    const smokers = data.filter(d => d.smoker);
    const nonSmokers = data.filter(d => !d.smoker);

    const avgSmokerClaim = smokers.reduce((sum, d) => sum + d.claim, 0) / (smokers.length || 1);
    const avgNonSmokerClaim = nonSmokers.reduce((sum, d) => sum + d.claim, 0) / (nonSmokers.length || 1);

    return [
      { category: 'Smoker', average: avgSmokerClaim, count: smokers.length },
      { category: 'Non-Smoker', average: avgNonSmokerClaim, count: nonSmokers.length }
    ];
  };

  // BMI vs claims scatter
  const getBmiVsClaims = () => {
    return data
      .map(d => ({
        bmi: d.bmi,
        claim: d.claim,
        gender: d.gender,
        PatientID: d.PatientID
      }))
      .sort((a, b) => a.bmi - b.bmi);
  };

  const claimsDistribution = getClaimsDistribution();
  const regionData = getClaimsByRegion();
  const ageVsClaimsData = getAgeVsClaims();
  const smokerComparisonData = getSmokerComparison();
  const bmiVsClaimsData = getBmiVsClaims();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Claims Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={claimsDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Claims by Region */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Average Claims by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : parseFloat(String(value)).toFixed(2)}`} />
              <Bar dataKey="avg" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age vs Claims Scatter */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Age vs Claim Amount</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={ageVsClaimsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="age" name="Age" domain={[18, 65]} />
              <YAxis type="number" dataKey="claim" name="Claim ($)" domain={[0, 'dataMax']} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return <div className="bg-white p-2 border border-gray-300 rounded shadow-lg text-sm"><p><strong>Patient ID:</strong> {data.PatientID}</p><p><strong>Age:</strong> {data.age}</p><p><strong>Claim:</strong> ${data.claim.toFixed(2)}</p><p><strong>Status:</strong> {data.smoker}</p></div>;
                }
                return null;
              }} />
              <Legend />
              <Scatter
                name="Smokers"
                data={ageVsClaimsData.filter(d => d.smoker === 'Smoker')}
                fill="#f97316"
              />
              <Scatter
                name="Non-Smokers"
                data={ageVsClaimsData.filter(d => d.smoker === 'Non-Smoker')}
                fill="#6366f1"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Smoker vs Non-Smoker Comparison */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Smoker vs Non-Smoker Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={smokerComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : parseFloat(String(value)).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="average" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">BMI vs Claim Amount</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={bmiVsClaimsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="bmi" name="BMI" domain={['dataMin - 1', 'dataMax + 1']} />
            <YAxis type="number" dataKey="claim" name="Claim ($)" domain={[0, 'dataMax']} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return <div className="bg-white p-2 border border-gray-300 rounded shadow-lg text-sm"><p><strong>Patient ID:</strong> {data.PatientID}</p><p><strong>BMI:</strong> {data.bmi.toFixed(2)}</p><p><strong>Claim:</strong> ${data.claim.toFixed(2)}</p><p><strong>Gender:</strong> {data.gender}</p></div>;
              }
              return null;
            }} />
            <Legend />
            <Scatter name="Male" data={bmiVsClaimsData.filter(d => d.gender === 'male')} fill="#06b6d4" />
            <Scatter name="Female" data={bmiVsClaimsData.filter(d => d.gender === 'female')} fill="#f472b6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
