import React, { useState } from 'react';
import { DetectedObject } from '../types';
import { Eye, EyeOff, Tag } from 'lucide-react';

interface BoundingBoxOverlayProps {
  imageUrl: string;
  detectedObjects: DetectedObject[];
}

const BOX_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
];

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  imageUrl,
  detectedObjects,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const objectsWithBoxes = detectedObjects.filter(
    (obj) => obj.box2d && Array.isArray(obj.box2d) && obj.box2d.length === 4
  );

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Tag className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">Detected Visual Components ({detectedObjects.length})</span>
        </div>
        {objectsWithBoxes.length > 0 && (
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
          >
            {showBoxes ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Bounding Boxes</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Show Bounding Boxes</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Image Container with SVG Overlay */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[500px]">
        <img
          src={imageUrl}
          alt="Analyzed target"
          className="max-h-[500px] w-auto max-w-full object-contain block mx-auto"
        />

        {/* Bounding Box Canvas Overlay */}
        {showBoxes && objectsWithBoxes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* We map coordinates assuming box2d is [ymin, xmin, ymax, xmax] normalized 0..1000 */}
            <svg className="w-full h-full absolute inset-0 pointer-events-auto">
              {objectsWithBoxes.map((obj, idx) => {
                if (!obj.box2d) return null;
                const [ymin, xmin, ymax, xmax] = obj.box2d;
                const color = BOX_COLORS[idx % BOX_COLORS.length];
                const isHovered = hoveredIndex === idx;

                const topPercent = ymin / 10;
                const leftPercent = xmin / 10;
                const widthPercent = (xmax - xmin) / 10;
                const heightPercent = (ymax - ymin) / 10;

                return (
                  <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                    <rect
                      x={`${leftPercent}%`}
                      y={`${topPercent}%`}
                      width={`${widthPercent}%`}
                      height={`${heightPercent}%`}
                      fill={isHovered ? `${color}25` : `${color}10`}
                      stroke={color}
                      strokeWidth={isHovered ? 3 : 2}
                      rx={4}
                      className="transition-all duration-200 cursor-pointer"
                    />
                    {/* Object Label Tag */}
                    <foreignObject
                      x={`${leftPercent}%`}
                      y={`${Math.max(0, topPercent - 5)}%`}
                      width="200"
                      height="30"
                      className="overflow-visible pointer-events-none"
                    >
                      <div
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-lg whitespace-nowrap"
                        style={{ backgroundColor: color }}
                      >
                        <span>{obj.objectName}</span>
                        <span className="opacity-80">({obj.confidence}%)</span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Detected Object Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {detectedObjects.map((obj, idx) => {
          const color = BOX_COLORS[idx % BOX_COLORS.length];
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                isHovered
                  ? 'bg-slate-800 border-indigo-500 text-white scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <span>{obj.objectName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{obj.confidence}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
