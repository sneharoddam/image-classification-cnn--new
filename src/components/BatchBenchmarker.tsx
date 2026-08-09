import React, { useState } from 'react';
import { CustomDataset, BatchItemResult, ImageClassificationResult } from '../types';
import {
  BarChart2,
  Upload,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Award,
  Layers,
} from 'lucide-react';

interface BatchBenchmarkerProps {
  datasets: CustomDataset[];
  selectedDatasetId: string;
  onViewSingleResult: (result: ImageClassificationResult) => void;
}

export const BatchBenchmarker: React.FC<BatchBenchmarkerProps> = ({
  datasets,
  selectedDatasetId,
  onViewSingleResult,
}) => {
  const [targetDatasetId, setTargetDatasetId] = useState(selectedDatasetId);
  const [batchItems, setBatchItems] = useState<BatchItemResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeDataset = datasets.find((d) => d.id === targetDatasetId);

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: BatchItemResult[] = [];
    let count = 0;

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newItems.push({
            fileName: file.name,
            result: null,
            status: 'pending',
          });

          // Store image on custom object
          (newItems[newItems.length - 1] as any).imagePayload = reader.result;

          count++;
          if (count === files.length) {
            setBatchItems((prev) => [...prev, ...newItems]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const runBatchBenchmarking = async () => {
    if (batchItems.length === 0) return;
    setIsRunning(true);
    setProgress(10);

    const customCategories = activeDataset ? activeDataset.categories : [];
    const datasetName = activeDataset ? activeDataset.name : undefined;

    const payloadItems = batchItems.map((item, idx) => ({
      id: `batch-${idx}-${Date.now()}`,
      fileName: item.fileName,
      image: (item as any).imagePayload,
    }));

    try {
      const res = await fetch('/api/batch-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payloadItems,
          customCategories,
          datasetName,
        }),
      });

      setProgress(80);
      const data = await res.json();

      if (data.success && data.results) {
        setBatchItems((prev) =>
          prev.map((item, idx) => {
            const found = data.results.find((r: any) => r.fileName === item.fileName || r.id === payloadItems[idx]?.id);
            if (found) {
              return {
                ...item,
                status: found.status,
                result: found.result,
                error: found.error,
              };
            }
            return item;
          })
        );
      } else {
        alert('Batch process failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Network error in batch processing: ' + err.message);
    } finally {
      setProgress(100);
      setIsRunning(false);
    }
  };

  // Calculate stats
  const completedCount = batchItems.filter((i) => i.status === 'completed').length;
  const totalConfidence = batchItems.reduce(
    (acc, curr) => acc + (curr.result?.primaryConfidence || 0),
    0
  );
  const avgConfidence = completedCount > 0 ? (totalConfidence / completedCount).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <span>Batch Benchmark & Accuracy Evaluator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test multiple images simultaneously against your custom dataset categories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={targetDatasetId}
            onChange={(e) => setTargetDatasetId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 px-3 py-2"
          >
            <option value="none">🌐 General World Categories</option>
            {datasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                📁 {ds.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Zone & Run Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Select Multiple Photos ({batchItems.length} loaded)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleMultipleFiles}
            />
          </label>

          <div className="flex items-center space-x-2">
            {batchItems.length > 0 && (
              <button
                onClick={() => setBatchItems([])}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Clear Queue
              </button>
            )}

            <button
              onClick={runBatchBenchmarking}
              disabled={batchItems.length === 0 || isRunning}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-md shadow-indigo-600/20 transition"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Batch Classification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div className="space-y-1">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 text-right">Evaluating dataset matches...</p>
          </div>
        )}
      </div>

      {/* Summary Stats Overview Cards */}
      {completedCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-white">{completedCount}</span>
              <span className="text-xs text-slate-400 block">Evaluated Images</span>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-emerald-400">{avgConfidence}%</span>
              <span className="text-xs text-slate-400 block">Average Confidence</span>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-purple-300">
                {activeDataset ? activeDataset.name : 'General'}
              </span>
              <span className="text-xs text-slate-400 block">Target Context</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {batchItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-300 uppercase tracking-wider">
            Batch Results Queue ({batchItems.length} items)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Image</th>
                  <th className="p-3 font-semibold">File Name</th>
                  <th className="p-3 font-semibold">Recognized Category</th>
                  <th className="p-3 font-semibold">Confidence Score</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batchItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="w-12 h-12 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                        <img
                          src={(item as any).imagePayload}
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="p-3 font-medium text-slate-200">{item.fileName}</td>

                    <td className="p-3 font-semibold text-slate-100">
                      {item.result ? item.result.primaryCategory : 'Pending...'}
                    </td>

                    <td className="p-3">
                      {item.result ? (
                        <div className="space-y-1 max-w-[120px]">
                          <span className="font-mono font-bold text-indigo-400">
                            {item.result.primaryConfidence.toFixed(1)}%
                          </span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${item.result.primaryConfidence}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="p-3">
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-500/20">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Evaluating</span>
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-slate-500 text-[10px]">Queued</span>
                      )}
                      {item.status === 'failed' && (
                        <span className="inline-flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-rose-500/20">
                          <AlertCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {item.result && (
                        <button
                          onClick={() => onViewSingleResult(item.result!)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-md border border-slate-700 font-medium inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
