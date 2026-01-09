import React from 'react';

// Very small, dependency-free bar chart using SVG.
export default function SimpleBarChart({ data = [], width = 600, height = 200, color = '#4F46E5' }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500">No chart data</div>;
  }

  const max = Math.max(...data.map((d) => d.value));
  const pad = 16;
  const barWidth = (width - pad * 2) / data.length - 8;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="200">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const x = pad + i * (barWidth + 8);
        const h = max === 0 ? 0 : (d.value / max) * (height - 40);
        const y = height - h - 20;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={h} rx={4} fill="url(#g1)" />
            <text x={x + barWidth / 2} y={height - 4} fontSize="10" textAnchor="middle" fill="#374151">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
