import * as React from 'react';
import { useState, useMemo } from 'react';
import { FileUploadComponent } from './components/FileUploadComponent';
import { KPICards } from './components/KPICards';
import { SearchFilter } from './components/SearchFilter';
import { MainDataGrid } from './components/MainDataGrid';
import { Dashboard } from './components/Dashboard';
import { ParsedDataset, InsuranceClaim, KPIData } from './types';

function App() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [filteredData, setFilteredData] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'dashboard'>('grid');

  const handleDataLoaded = (data: ParsedDataset) => {
    setDataset(data);
    setFilteredData(data.data);
  };

  const handleFilterChange = (filtered: InsuranceClaim[]) => {
    setFilteredData(filtered);
  };

  const kpiData: KPIData | null = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const totalClaimsValue = filteredData.reduce((sum, d) => sum + d.claim, 0);
    const averageClaimAmount = totalClaimsValue / filteredData.length;
    const totalPatients = filteredData.length;

    const smokers = filteredData.filter(d => d.smoker);
    const nonSmokers = filteredData.filter(d => !d.smoker);

    const averageSmokerClaim = smokers.length > 0
      ? smokers.reduce((sum, d) => sum + d.claim, 0) / smokers.length
      : 0;

    const averageNonSmokerClaim = nonSmokers.length > 0
      ? nonSmokers.reduce((sum, d) => sum + d.claim, 0) / nonSmokers.length
      : 0;

    return {
      totalClaimsValue,
      averageClaimAmount,
      totalPatients,
      averageSmokerClaim,
      averageNonSmokerClaim
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Claims Dashboard</h1>
          <p className="text-gray-600 mt-1">Visualize and analyze insurance claim data</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!dataset ? (
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <FileUploadComponent
              onDataLoaded={handleDataLoaded}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
            </div>

            {activeTab === 'grid' ? (
              <>
                <KPICards kpiData={kpiData} />
                <SearchFilter data={dataset.data} onFilterChange={handleFilterChange} />
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Claims Data</h3>
                  <MainDataGrid data={filteredData} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <Dashboard data={filteredData} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
