import * as React from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { ParsedDataset } from '../types';

interface FileUploadComponentProps {
  onDataLoaded: (dataset: ParsedDataset) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onDataLoaded,
  loading,
  setLoading,
  error,
  setError
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        onDataLoaded(response.data.dataset);
      }
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded, setError, setLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">Uploading and parsing CSV...</p>
          </>
        ) : isDragActive ? (
          <>
            <p className="text-lg font-semibold text-blue-600">Drop the CSV file here</p>
            <p className="text-sm text-blue-500">The file will be uploaded immediately</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-700">Drag and drop a CSV file here</p>
            <p className="text-sm text-gray-500">or click to select a file</p>
          </>
        )}
      </div>
      {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
    </div>
  );
};
