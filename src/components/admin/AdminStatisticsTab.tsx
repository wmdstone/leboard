import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Target, Activity, Zap, CheckSquare, Settings } from 'lucide-react';
import { useAdminStatsQuery, useAppEventsQuery } from '../../hooks/useAppQueries';
import { TimeRangeFilter } from '../TimeRangeFilter';
import { createDefaultTimeRangeValue, TimeRangeValue } from '../TimeRangeFilter';

export function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className='bg-base-50 p-6 rounded-2xl border border-base-200 shadow-sm flex items-center gap-4'>
      <div className={'p-4 rounded-xl bg-base-100 ' + color + ' shadow-sm border border-base-200'}>
        <Icon className='w-6 h-6' />
      </div>
      <div>
        <p className='text-xs font-bold uppercase tracking-widest text-text-muted mb-1'>{title}</p>
        <p className='text-2xl font-black text-text-main'>{value || 0}</p>
      </div>
    </div>
  );
}

export function AdminStatisticsTab() {
  const [filter, setFilter] = useState<TimeRangeValue>(() => createDefaultTimeRangeValue('last-week'));
  const { data, isLoading } = useAdminStatsQuery(filter);
  const { data: events } = useAppEventsQuery(filter);
  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h3 className='text-2xl font-black text-text-main py-2'>Analytics & Usage</h3>
        <TimeRangeFilter value={filter} onChange={setFilter} />
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <StatCard title='Users' value={data?.stats?.totalUsers || 0} icon={Users} color='text-blue-500' />
        <StatCard title='Goals' value={data?.stats?.totalGoals || events?.length || 0} icon={Target} color='text-emerald-500' />
      </div>
    </div>
  );
}
