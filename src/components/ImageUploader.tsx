import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Link as LinkIcon, RefreshCw, X, Sparkles, Check } from 'lucide-react';
import { CustomDataset } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64Image: string) => void;
  isLoading: boolean;
  datasets: CustomDataset[];
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
}

const SAMPLE_TEST_PHOTOS = [
  {
    name: 'Lion in Savanna',
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
    category: 'Fauna',
  },
  {
    name: 'Gothic Cathedral Spire',
    url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=800&q=80',
    category: 'Architecture',
  },
  {
    name: 'Golden Retriever Dog',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    category: 'Pets',
  },
  {
    name: 'Modern Glass Skyscraper',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    category: 'Architecture',
  },
  {
    name: 'Fresh Italian Pasta',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    category: 'Culinary',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  datasets,
  selectedDatasetId,
  setSelectedDatasetId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const fetchImageFromUrl = async (url: string) => {
    if (!url.trim()) return;
    try {
      // Convert external image URL to base64 via image element
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        onImageSelected(dataURL);
        setShowUrlModal(false);
        setUrlInput('');
      };
      img.onerror = () => {
        alert('Could not load image from this URL. Please verify cross-origin access or try downloading it.');
      };
      img.src = url;
    } catch (err) {
      alert('Error fetching URL image.');
    }
  };

  // Camera logic
  const startCamera = async () => {
    setShowCamera(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError('Unable to access camera. Please allow camera permissions or check device.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      stopCamera();
      onImageSelected(dataURL);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Target Custom Dataset Selector Header */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
            Active Dataset Context
          </label>
          <p className="text-sm text-slate-300">
            Select a custom dataset to compare the uploaded photo against custom categories & reference samples:
          </p>
        </div>
        <select
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="none">🌐 None (General World Categories Only)</option>
          {datasets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              📁 {ds.name} ({ds.categories.length} categories)
            </option>
          ))}
        </select>
      </div>

      {/* Primary Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-700 hover:border-indigo-500/70 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4 pointer-events-none">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Drop your photo here, or <span className="text-indigo-400 underline decoration-indigo-400/30">browse</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports JPEG, PNG, WebP, GIF (Max size 20MB)
            </p>
          </div>

          {/* Alternative buttons */}
          <div className="pt-2 flex items-center justify-center space-x-3 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Use Camera</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowUrlModal(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Image URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Example Test Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or test with a sample photo from our gallery:
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SAMPLE_TEST_PHOTOS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => fetchImageFromUrl(sample.url)}
              disabled={isLoading}
              className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 text-left transition bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-slate-200 truncate">{sample.name}</p>
                <span className="text-[10px] text-slate-400">{sample.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                <span>Load Image from Web URL</span>
              </h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter a direct image link (ending in .jpg, .png, etc.):
            </p>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => fetchImageFromUrl(urlInput)}
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
              >
                Fetch & Analyze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <span>Live Camera Snapshot</span>
              </h3>
              <button onClick={stopCamera} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                {cameraError}
              </div>
            ) : (
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
              {!cameraError && (
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
