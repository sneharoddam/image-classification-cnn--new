import React, { useState } from 'react';
import { ImageClassificationResult } from '../types';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import { ConfidenceCharts } from './ConfidenceCharts';
import {
  CheckCircle2,
  AlertCircle,
  Share2,
  Download,
  Copy,
  Sparkles,
  Layers,
  Palette,
  Eye,
  Check,
  RotateCcw,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface ClassificationResultsProps {
  result: ImageClassificationResult;
  onReset: () => void;
}

export const ClassificationResults: React.FC<ClassificationResultsProps> = ({
  result,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (confidence >= 65) return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
    if (confidence >= 45) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  const copySummary = () => {
    const text = `Image Recognition Result:
Category: ${result.primaryCategory}
Confidence Score: ${result.primaryConfidence}%
Key Tags: ${result.tags.join(', ')}
Explanation: ${result.detailedExplanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classification-${result.primaryCategory.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Primary Result Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Glow accent in top right */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Primary Classification</span>
              </span>
              
              {result.datasetNameUsed && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dataset: {result.datasetNameUsed}</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline space-x-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {result.primaryCategory}
              </h2>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {result.detailedExplanation}
            </p>

            {/* Tags list */}
            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Large Confidence Meter Score Card */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2 min-w-[200px]">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Confidence Score
            </div>

            <div className="relative flex items-center justify-center">
              <span className="text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                {result.primaryConfidence.toFixed(1)}%
              </span>
            </div>

            <div
              className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center space-x-1 ${getConfidenceBadgeColor(
                result.primaryConfidence
              )}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {result.primaryConfidence >= 85
                  ? 'High Certainty'
                  : result.primaryConfidence >= 65
                  ? 'Moderate Certainty'
                  : 'Low Certainty'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={copySummary}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={downloadReportJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON Report</span>
            </button>
          </div>

          <button
            onClick={onReset}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Classify Another Photo</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Bounding Box Overlay, Right Custom Dataset Match & Attributes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Image with Bounding Boxes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Visual Component Analysis & Region Overlay</span>
          </h3>
          <BoundingBoxOverlay
            imageUrl={result.imageUrl}
            detectedObjects={result.detectedObjects}
          />
        </div>

        {/* Right Column: Custom Dataset Match & Visual Attributes */}
        <div className="space-y-6">
          
          {/* Custom Dataset Match Card (if present) */}
          {result.customDatasetMatch && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Custom Dataset Matching Analysis</span>
                </h3>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {result.customDatasetMatch.matchScore}% Match
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Best Matched Category:</span>
                  <span className="text-slate-100 font-semibold text-sm">
                    {result.customDatasetMatch.bestMatchedCategoryName || 'None'}
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {result.customDatasetMatch.reasoning}
                </p>

                {result.customDatasetMatch.distinguishingFeatures?.length > 0 && (
                  <div>
                    <span className="text-slate-400 block mb-1">Key Distinguishing Features:</span>
                    <ul className="space-y-1">
                      {result.customDatasetMatch.distinguishingFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visual Attributes Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Extracted Image Attributes</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Main Subject</span>
                <span className="text-slate-100 font-medium truncate block mt-0.5">
                  {result.attributes.mainSubject || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Lighting Conditions</span>
                <span className="text-slate-100 font-medium truncate block mt-0.5">
                  {result.attributes.lighting || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Composition & framing</span>
                <span className="text-slate-100 font-medium truncate block mt-0.5">
                  {result.attributes.composition || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Background Environment</span>
                <span className="text-slate-100 font-medium truncate block mt-0.5">
                  {result.attributes.backgroundType || 'N/A'}
                </span>
              </div>
            </div>

            {/* Dominant Color Palette */}
            {result.attributes.dominantColors && result.attributes.dominantColors.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  Dominant Color Palette:
                </span>
                <div className="flex items-center space-x-2">
                  {result.attributes.dominantColors.map((color, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                      <span
                        className="w-3.5 h-3.5 rounded-md border border-white/20"
                        style={{ backgroundColor: color }}
                      ></span>
                      <span className="text-slate-300 font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Score Breakdown Charts */}
      <ConfidenceCharts
        confidenceBreakdown={result.confidenceBreakdown}
        primaryCategory={result.primaryCategory}
      />
    </div>
  );
};
