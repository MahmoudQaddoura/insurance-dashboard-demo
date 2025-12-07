import * as React from 'react';
import { KPIData } from '../types';

interface KPICardsProps {
  kpiData: KPIData | null;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpiData }) => {
  if (!kpiData) return null;

  const kpis = [
    {
      label: 'Total Claims Value',
      value: `$${kpiData.totalClaimsValue.toFixed(2)}`,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      label: 'Average Claim Amount',
      value: `$${kpiData.averageClaimAmount.toFixed(2)}`,
      color: 'bg-green-50 border-green-200'
    },
    {
      label: 'Total Patients',
      value: kpiData.totalPatients.toString(),
      color: 'bg-purple-50 border-purple-200'
    },
    {
      label: 'Avg Smoker Claim',
      value: `$${kpiData.averageSmokerClaim.toFixed(2)}`,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      label: 'Avg Non-Smoker Claim',
      value: `$${kpiData.averageNonSmokerClaim.toFixed(2)}`,
      color: 'bg-indigo-50 border-indigo-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className={`border rounded-lg p-4 ${kpi.color}`}>
          <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};
