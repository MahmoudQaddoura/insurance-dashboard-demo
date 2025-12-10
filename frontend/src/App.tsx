import * as React from 'react';
import { useState } from 'react';
import { FileUploadComponent } from './components/FileUploadComponent';
import { MainDataGrid } from './components/MainDataGrid';
import { ParsedDataset } from './types';

function App() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = (data: ParsedDataset) => {
    setDataset(data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Data Platform</h1>
          <p className="text-gray-600 mt-1">Upload and explore any dataset (CSV, JSON, TSV)</p>
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
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Preview</h2>
                <p className="text-gray-600 text-sm">{dataset.rowCount} rows • {dataset.columns.length} columns</p>
              </div>
              <button
                onClick={() => setDataset(null)}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Upload Different File
              </button>
              <MainDataGrid data={dataset.data} columns={dataset.columns} metadata={dataset.metadata} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
