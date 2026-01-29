import React from 'react';
import { PRODUCTS } from '../../data/mockData';

export default function AdminProductsChart() {
  const counts = PRODUCTS.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Products by Category</h3>
      <div className="w-full overflow-x-auto">
        <svg width={500} height={180} viewBox={`0 0 500 180`} className="block">
          {entries.map(([cat, value], i) => {
            const barWidth = 60;
            const gap = 16;
            const x = i * (barWidth + gap) + 20;
            const barMaxHeight = 110;
            const height = (value / max) * barMaxHeight;
            const y = 140 - height;
            return (
              <g key={cat}>
                <rect x={x} y={y} width={barWidth} height={height} rx={8} fill="#60a5fa" />
                <text x={x + barWidth / 2} y={155} fontSize={12} textAnchor="middle" fill="#0f172a" className="font-semibold">
                  {cat}
                </text>
                <text x={x + barWidth / 2} y={170} fontSize={11} textAnchor="middle" fill="#475569">
                  {value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
