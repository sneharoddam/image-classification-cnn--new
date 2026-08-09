import React from 'react';
import { Sparkles, Layers, Database, BarChart2, History, Camera, Info } from 'lucide-react';

interface NavbarProps {
  activeTab: 'classifier' | 'datasets' | 'batch' | 'history';
  setActiveTab: (tab: 'classifier' | 'datasets' | 'batch' | 'history') => void;
  activeDatasetName: string;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeDatasetName,
  historyCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  VisionClassify AI
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Custom Dataset Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Image Category Recognition & Confidence Scoring
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('classifier')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'classifier'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Recognizer</span>
            </button>

            <button
              onClick={() => setActiveTab('datasets')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'datasets'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Custom Datasets</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeDatasetName}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'batch'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Batch Benchmark</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History Log</span>
              {historyCount > 0 && (
                <span className="ml-1 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Gemini 3.6 Flash Active</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-800 py-2 overflow-x-auto space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('classifier')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'classifier' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Recognizer</span>
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'datasets' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Datasets</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'batch' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Batch Benchmark</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({historyCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
