import React, { useState } from 'react';
import { CategoryConfidence } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Info, BarChart2, PieChart as PieIcon, CheckCircle2 } from 'lucide-react';

interface ConfidenceChartsProps {
  confidenceBreakdown: CategoryConfidence[];
  primaryCategory: string;
}

const BAR_COLORS = [
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#64748B', // Slate
];

export const ConfidenceCharts: React.FC<ConfidenceChartsProps> = ({
  confidenceBreakdown,
  primaryCategory,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfidence | null>(
    confidenceBreakdown[0] || null
  );

  // Format data sorted by confidence desc
  const sortedData = [...confidenceBreakdown].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
      
      {/* Chart Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Category Confidence Score Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400">
            Probability distribution across recognized target categories
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 self-start">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              chartType === 'pie'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Distribution</span>
          </button>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  setSelectedCategory(state.activePayload[0].payload);
                }
              }}
            >
              <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" fontSize={11} />
              <YAxis
                type="category"
                dataKey="categoryName"
                stroke="#94a3b8"
                fontSize={12}
                width={120}
                tickFormatter={(val) => (val.length > 16 ? val.substring(0, 15) + '…' : val)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryConfidence;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs max-w-xs space-y-1">
                        <div className="font-bold text-slate-100 flex items-center justify-between">
                          <span>{data.categoryName}</span>
                          <span className="text-indigo-400 ml-2">{data.confidence.toFixed(1)}%</span>
                        </div>
                        {data.reasoning && (
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {data.reasoning}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="confidence" radius={[0, 6, 6, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={sortedData}
                dataKey="confidence"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={3}
                label={({ categoryName, confidence }) => `${categoryName}: ${confidence.toFixed(0)}%`}
                labelLine={false}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`pie-cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    className="cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${Number(value).toFixed(1)}%`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Selected Category Reasoning Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {sortedData.map((cat, idx) => {
          const isTop = cat.categoryName === primaryCategory;
          const isSelected = selectedCategory?.categoryName === cat.categoryName;

          return (
            <div
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                  ></span>
                  <span className="font-semibold text-xs text-slate-100 flex items-center space-x-1">
                    <span>{cat.categoryName}</span>
                    {isTop && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Top Result
                      </span>
                    )}
                    {cat.isCustomCategory && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                        Custom Dataset
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-indigo-400">
                  {cat.confidence.toFixed(1)}%
                </span>
              </div>

              {/* Progress meter bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, cat.confidence))}%`,
                    backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                  }}
                ></div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {cat.reasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
