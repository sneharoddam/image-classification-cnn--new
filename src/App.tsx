import React, { useState, useEffect } from 'react';
import { CustomDataset, ImageClassificationResult } from './types';
import { PRESET_DATASETS } from './data/presetDatasets';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { ClassificationResults } from './components/ClassificationResults';
import { DatasetManager } from './components/DatasetManager';
import { BatchBenchmarker } from './components/BatchBenchmarker';
import { HistoryView } from './components/HistoryView';
import { Sparkles, Loader2, AlertCircle, Layers, ShieldAlert, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'classifier' | 'datasets' | 'batch' | 'history'>('classifier');

  // Datasets state
  const [datasets, setDatasets] = useState<CustomDataset[]>(() => {
    try {
      const saved = localStorage.getItem('visionclassify_datasets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRESET_DATASETS;
  });

  const [activeDatasetId, setActiveDatasetId] = useState<string>(() => {
    return PRESET_DATASETS[0]?.id || 'none';
  });

  // Classification state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ImageClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History log
  const [history, setHistory] = useState<ImageClassificationResult[]>(() => {
    try {
      const saved = localStorage.getItem('visionclassify_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Save datasets & history to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('visionclassify_datasets', JSON.stringify(datasets));
    } catch (e) {}
  }, [datasets]);

  useEffect(() => {
    try {
      localStorage.setItem('visionclassify_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  // Handle classify image
  const handleImageSelected = async (base64Image: string) => {
    setSelectedImage(base64Image);
    setIsLoading(true);
    setError(null);

    const activeDataset = datasets.find((d) => d.id === activeDatasetId);
    const customCategories = activeDataset ? activeDataset.categories : [];
    const datasetName = activeDataset ? activeDataset.name : undefined;

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          customCategories,
          datasetName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to classify image.');
      }

      const formattedResult: ImageClassificationResult = {
        id: `res-${Date.now()}`,
        imageUrl: base64Image,
        timestamp: new Date().toISOString(),
        primaryCategory: data.data.primaryCategory,
        primaryConfidence: data.data.primaryConfidence,
        confidenceBreakdown: data.data.confidenceBreakdown || [],
        detectedObjects: data.data.detectedObjects || [],
        attributes: data.data.attributes || {},
        customDatasetMatch: data.data.customDatasetMatch || null,
        tags: data.data.tags || [],
        detailedExplanation: data.data.detailedExplanation || '',
        datasetNameUsed: datasetName,
      };

      setCurrentResult(formattedResult);
      setHistory((prev) => [formattedResult, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing image classification.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeDatasetObj = datasets.find((d) => d.id === activeDatasetId);
  const activeDatasetName = activeDatasetObj ? activeDatasetObj.name : 'General';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDatasetName={activeDatasetName}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Tab 1: Single Image Recognizer */}
        {activeTab === 'classifier' && (
          <div className="space-y-6">
            
            {/* Header Title */}
            {!currentResult && !isLoading && (
              <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Multimodal Computer Vision Model</span>
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Image Recognition & Category Classification
                </h1>
                <p className="text-sm text-slate-400">
                  Upload any photo to identify categories, probability scores, bounding box regions, visual attributes, and evaluate against your custom datasets.
                </p>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-rose-300 text-xs flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Analyzing Photo Features...</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Extracting visual components, computing confidence probabilities, and matching custom dataset categories.
                  </p>
                </div>
              </div>
            )}

            {/* Upload form if no result yet */}
            {!isLoading && !currentResult && (
              <ImageUploader
                onImageSelected={handleImageSelected}
                isLoading={isLoading}
                datasets={datasets}
                selectedDatasetId={activeDatasetId}
                setSelectedDatasetId={setActiveDatasetId}
              />
            )}

            {/* Results display */}
            {!isLoading && currentResult && (
              <ClassificationResults
                result={currentResult}
                onReset={() => {
                  setCurrentResult(null);
                  setSelectedImage(null);
                }}
              />
            )}
          </div>
        )}

        {/* Tab 2: Custom Datasets Manager */}
        {activeTab === 'datasets' && (
          <DatasetManager
            datasets={datasets}
            activeDatasetId={activeDatasetId}
            setActiveDatasetId={setActiveDatasetId}
            onUpdateDatasets={setDatasets}
          />
        )}

        {/* Tab 3: Batch Benchmarking */}
        {activeTab === 'batch' && (
          <BatchBenchmarker
            datasets={datasets}
            selectedDatasetId={activeDatasetId}
            onViewSingleResult={(result) => {
              setCurrentResult(result);
              setActiveTab('classifier');
            }}
          />
        )}

        {/* Tab 4: History Log */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectResult={(result) => {
              setCurrentResult(result);
              setActiveTab('classifier');
            }}
            onClearHistory={() => setHistory([])}
          />
        )}
      </main>
    </div>
  );
}
