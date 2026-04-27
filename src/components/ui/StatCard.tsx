import React from 'react';

export function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-base-50 p-6 rounded-2xl border border-base-200 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl bg-base-100 ${color} shadow-sm border border-base-200`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">{title}</p>
        <p className="text-2xl font-black text-text-main">{value || 0}</p>
      </div>
    </div>
  );
}
