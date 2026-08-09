import React, { useState } from 'react';
import { CustomDataset, CustomCategory, SampleImage } from '../types';
import {
  FolderPlus,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Upload,
  CheckCircle2,
  Database,
  Layers,
  BarChart3,
  Edit2,
  X,
  Loader2,
  Check,
} from 'lucide-react';

interface DatasetManagerProps {
  datasets: CustomDataset[];
  activeDatasetId: string;
  setActiveDatasetId: (id: string) => void;
  onUpdateDatasets: (newDatasets: CustomDataset[]) => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  datasets,
  activeDatasetId,
  setActiveDatasetId,
  onUpdateDatasets,
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    activeDatasetId !== 'none' ? activeDatasetId : datasets[0]?.id || ''
  );
  
  // Modals state
  const [showNewDatasetModal, setShowNewDatasetModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showAddSampleModal, setShowAddSampleModal] = useState<string | null>(null); // categoryId

  // Form states
  const [newDsName, setNewDsName] = useState('');
  const [newDsDesc, setNewDsDesc] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');

  const [sampleCaption, setSampleCaption] = useState('');
  const [generatingAiSample, setGeneratingAiSample] = useState(false);

  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  // Create Dataset
  const handleCreateDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsName.trim()) return;

    const newDataset: CustomDataset = {
      id: `custom-ds-${Date.now()}`,
      name: newDsName.trim(),
      description: newDsDesc.trim() || 'Custom user created image dataset.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: [
        {
          id: `cat-${Date.now()}-1`,
          name: 'Class A',
          description: 'Default category A',
          color: '#3B82F6',
          samples: [],
        },
        {
          id: `cat-${Date.now()}-2`,
          name: 'Class B',
          description: 'Default category B',
          color: '#10B981',
          samples: [],
        },
      ],
    };

    const updated = [...datasets, newDataset];
    onUpdateDatasets(updated);
    setSelectedDatasetId(newDataset.id);
    setActiveDatasetId(newDataset.id);
    setShowNewDatasetModal(false);
    setNewDsName('');
    setNewDsDesc('');
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !currentDataset) return;

    const newCat: CustomCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      color: newCatColor,
      samples: [],
    };

    const updatedDs = {
      ...currentDataset,
      updatedAt: new Date().toISOString(),
      categories: [...currentDataset.categories, newCat],
    };

    const updated = datasets.map((d) => (d.id === currentDataset.id ? updatedDs : d));
    onUpdateDatasets(updated);
    setShowNewCategoryModal(false);
    setNewCatName('');
    setNewCatDesc('');
  };

  // Add Sample Image File to Category
  const handleSampleFileUpload = (categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentDataset) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newSample: SampleImage = {
          id: `samp-${Date.now()}`,
          url: reader.result,
          caption: sampleCaption || file.name,
          addedAt: new Date().toISOString(),
        };

        const updatedCategories = currentDataset.categories.map((cat) => {
          if (cat.id === categoryId) {
            return { ...cat, samples: [...cat.samples, newSample] };
          }
          return cat;
        });

        const updatedDs = { ...currentDataset, categories: updatedCategories };
        onUpdateDatasets(datasets.map((d) => (d.id === currentDataset.id ? updatedDs : d)));
        setShowAddSampleModal(null);
        setSampleCaption('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate AI Sample Image for Category
  const handleGenerateAiSample = async (category: CustomCategory) => {
    setGeneratingAiSample(true);
    try {
      const res = await fetch('/api/generate-sample-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: category.name,
          description: category.description,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        const newSample: SampleImage = {
          id: `samp-ai-${Date.now()}`,
          url: data.imageUrl,
          caption: `AI Generated Reference Sample for ${category.name}`,
          addedAt: new Date().toISOString(),
        };

        const updatedCategories = currentDataset.categories.map((cat) => {
          if (cat.id === category.id) {
            return { ...cat, samples: [...cat.samples, newSample] };
          }
          return cat;
        });

        const updatedDs = { ...currentDataset, categories: updatedCategories };
        onUpdateDatasets(datasets.map((d) => (d.id === currentDataset.id ? updatedDs : d)));
      } else {
        alert('Failed to generate sample image: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error generating sample: ' + err.message);
    } finally {
      setGeneratingAiSample(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = (categoryId: string) => {
    if (!currentDataset) return;
    if (currentDataset.categories.length <= 1) {
      alert('A dataset must have at least one category.');
      return;
    }
    const updatedCategories = currentDataset.categories.filter((c) => c.id !== categoryId);
    const updatedDs = { ...currentDataset, categories: updatedCategories };
    onUpdateDatasets(datasets.map((d) => (d.id === currentDataset.id ? updatedDs : d)));
  };

  // Delete Dataset
  const handleDeleteDataset = (datasetId: string) => {
    if (datasets.length <= 1) {
      alert('Cannot delete the last remaining dataset.');
      return;
    }
    const filtered = datasets.filter((d) => d.id !== datasetId);
    onUpdateDatasets(filtered);
    if (selectedDatasetId === datasetId) {
      setSelectedDatasetId(filtered[0].id);
    }
    if (activeDatasetId === datasetId) {
      setActiveDatasetId(filtered[0].id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Custom Dataset Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build, curate, and train custom image classification datasets with your own photos.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewDatasetModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Custom Dataset</span>
          </button>
        </div>
      </div>

      {/* Dataset Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
        {datasets.map((ds) => {
          const isActive = ds.id === selectedDatasetId;
          const isModelTarget = ds.id === activeDatasetId;

          return (
            <button
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-slate-800 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{ds.name}</span>
              <span className="text-[10px] bg-slate-950 px-1.5 py-0.2 rounded text-slate-400 border border-slate-800">
                {ds.categories.length} classes
              </span>
              {isModelTarget && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Model Context"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Dataset Details & Controls */}
      {currentDataset && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100">{currentDataset.name}</h3>
                {currentDataset.isPreset && (
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Built-in Preset
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentDataset.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveDatasetId(currentDataset.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center space-x-1.5 ${
                  activeDatasetId === currentDataset.id
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {activeDatasetId === currentDataset.id ? 'Active for Recognition' : 'Set as Model Target'}
                </span>
              </button>

              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category Class</span>
              </button>

              {!currentDataset.isPreset && (
                <button
                  onClick={() => handleDeleteDataset(currentDataset.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Delete Dataset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDataset.categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color || '#3B82F6' }}
                      ></span>
                      <h4 className="font-bold text-sm text-slate-100">{cat.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {cat.samples.length} samples
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[32px]">
                    {cat.description || 'No specific visual description defined.'}
                  </p>

                  {/* Sample Thumbnail Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {cat.samples.map((sample) => (
                      <div
                        key={sample.id}
                        className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800 group relative"
                      >
                        <img
                          src={sample.url}
                          alt={sample.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}

                    {cat.samples.length === 0 && (
                      <div className="col-span-3 py-6 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl">
                        <p className="text-[11px] text-slate-500">No reference photos added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Sample</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSampleFileUpload(cat.id, e)}
                      />
                    </label>

                    <button
                      onClick={() => handleGenerateAiSample(cat)}
                      disabled={generatingAiSample}
                      className="text-purple-400 hover:text-purple-300 font-medium flex items-center space-x-1 disabled:opacity-50"
                      title="Generate sample image with AI"
                    >
                      {generatingAiSample ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>AI Gen</span>
                    </button>
                  </div>

                  {currentDataset.categories.length > 1 && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Dataset Modal */}
      {showNewDatasetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateDataset}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <span>Create Custom Dataset</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewDatasetModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dataset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Electronic PCB Defect Types"
                  value={newDsName}
                  onChange={(e) => setNewDsName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  placeholder="e.g., Photos of solder bridges, missing chips, and clean circuit boards."
                  value={newDsDesc}
                  onChange={(e) => setNewDsDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 h-20"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewDatasetModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
              >
                Create Dataset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleAddCategory}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Add Custom Category Class</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCategoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Category Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Scratched Screen"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Visual Description / Guidance
                </label>
                <textarea
                  placeholder="Describe visual traits (e.g. key shapes, colors, patterns to look for)."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 h-20"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Badge Color Accent
                </label>
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg p-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
