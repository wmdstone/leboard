import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function RankMovement({ currentRank, previousRank }: { currentRank: number, previousRank?: number }) {
  if (previousRank === undefined || previousRank === null || previousRank === currentRank) {
    return <div className="text-base-300 font-bold text-xs flex items-center justify-center w-6">—</div>;
  }
  
  if (currentRank < previousRank) {
    return (
      <div className="flex flex-col items-center justify-center px-1.5 py-1 bg-accent-50/50 rounded-lg shrink-0">
        <ArrowUp className="w-3.5 h-3.5 text-accent-500" strokeWidth={3} />
        <span className="text-[10px] font-bold text-accent-600">{previousRank - currentRank}</span>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center px-1.5 py-1 bg-red-50 rounded-lg shrink-0">
        <ArrowDown className="w-3.5 h-3.5 text-red-500" strokeWidth={3} />
        <span className="text-[10px] font-bold text-red-600">{currentRank - previousRank}</span>
      </div>
    );
  }
}
