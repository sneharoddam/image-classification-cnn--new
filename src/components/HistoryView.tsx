import React, { useState } from 'react';
import { ImageClassificationResult } from '../types';
import {
  History,
  Search,
  Download,
  Trash2,
  Eye,
  Calendar,
  Tag,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface HistoryViewProps {
  history: ImageClassificationResult[];
  onSelectResult: (result: ImageClassificationResult) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectResult,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.primaryCategory.toLowerCase().includes(term) ||
      item.tags.some((t) => t.toLowerCase().includes(term)) ||
      (item.datasetNameUsed && item.datasetNameUsed.toLowerCase().includes(term))
    );
  });

  const exportAllCsv = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Primary Category', 'Confidence (%)', 'Tags', 'Explanation'];
    const rows = history.map((item) => [
      `"${item.timestamp}"`,
      `"${item.primaryCategory}"`,
      item.primaryConfidence,
      `"${item.tags.join('; ')}"`,
      `"${item.detailedExplanation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recognition-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllJson = () => {
    if (history.length === 0) return;
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recognition-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Image Recognition History Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review past classifications, score breakdowns, and export datasets.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAllCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportAllJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      {history.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search history by category, tag, or dataset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* History Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/70 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.primaryCategory}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 font-mono text-xs font-bold text-indigo-400 shadow-md">
                    {item.primaryConfidence.toFixed(1)}%
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 transition">
                      {item.primaryCategory}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.detailedExplanation}
                  </p>

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                          #{t}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </span>

                <span className="text-indigo-400 font-medium flex items-center space-x-1 group-hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Classification History Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload and analyze photos in the Recognizer tab to build your identification log.
          </p>
        </div>
      )}
    </div>
  );
};
