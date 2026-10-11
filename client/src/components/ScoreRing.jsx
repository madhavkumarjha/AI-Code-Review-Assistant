import React from 'react';
import PropTypes from 'prop-types';

export default function ScoreRing({ score = 75, size = 68, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#10B981'; // emerald-500
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/20';

  if (clampedScore < 65) {
    strokeColor = '#F43F5E'; // rose-500
    textColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/10 border-rose-500/20';
  } else if (clampedScore < 85) {
    strokeColor = '#F59E0B'; // amber-500
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className={`flex items-center space-x-3 px-3 py-2 rounded-2xl border ${badgeBg} shadow-inner`}>
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-sm font-extrabold font-mono ${textColor} leading-none`}>
            {clampedScore}
          </span>
          <span className="text-[8px] text-slate-500 font-mono">/100</span>
        </div>
      </div>
      <div className="text-left">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Quality Score</div>
        <div className={`text-xs font-semibold ${textColor}`}>
          {clampedScore >= 85 ? 'Production Ready' : clampedScore >= 65 ? 'Needs Optimization' : 'Critical Issues Found'}
        </div>
      </div>
    </div>
  );
}

ScoreRing.propTypes = {
  score: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number
};
