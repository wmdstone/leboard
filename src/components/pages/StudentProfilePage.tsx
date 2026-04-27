import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Target, Flame, Circle, CheckCircle2, ChevronDown, CheckSquare, FolderTree, ChevronUp } from 'lucide-react';
import { TimeRangeValue, createDefaultTimeRangeValue, TimeRangeFilter } from '../TimeRangeFilter';
import { DateRange, isWithinRange, POINTS_CAPTION } from '../../lib/timeRanges';
import { RankMovement } from '../ui/RankMovement';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, Line, BarChart, Bar } from 'recharts';
import { ImageFallback, dicebearAvatar } from '../ImageFallback';
import type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';
import { ActionMenu } from '../ui/ActionMenu';
import { ConfirmModal } from '../ui/ConfirmModal';

export // --- STUDENT PROFILE PAGE (with collapsible goals) ---
function StudentProfilePage({ studentId, students, masterGoals, categories, calculateTotalPoints, navigateTo }: {
  studentId: string;
  students: Student[];
  masterGoals: MasterGoal[];
  categories: Category[];
  calculateTotalPoints: (goals: AssignedGoal[]) => number;
  navigateTo: (path: string, params?: any) => void;
}) {
  const student = students.find(s => s.id === studentId);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  // Both charts now share the same reusable TimeRangeFilter (preset + date range).
  const [historyFilterValue, setHistoryFilterValue] = useState<TimeRangeValue>(() => createDefaultTimeRangeValue('all-time'));
  const [timelineFilterValue, setTimelineFilterValue] = useState<TimeRangeValue>(() => createDefaultTimeRangeValue('last-week'));

  const timelineData = React.useMemo(() => {
    if (!student?.assignedGoals) return { rows: [], totalGoals: 0, totalPoints: 0, days: 0 };
    // Resolve the active range. Unbounded sides fall back to the goal data extents.
    const now = new Date();
    const completedTs = student.assignedGoals
      .filter(g => g.completed && g.completedAt)
      .map(g => new Date(g.completedAt!).getTime())
      .filter(t => !isNaN(t));
    const minTs = completedTs.length ? Math.min(...completedTs) : now.getTime();
    const startDate = timelineFilterValue.range.start ?? new Date(minTs);
    const endDate = timelineFilterValue.range.end ?? now;
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const dayMs = 86400000;
    const days = Math.max(1, Math.min(366, Math.round((end.getTime() - start.getTime()) / dayMs) + 1));
    const compact = days > 14;

    // Build a date->{goals,points} map keyed by YYYY-MM-DD
    const map = new Map<string, { goals: number; points: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { goals: 0, points: 0 });
    }

    let totalGoals = 0;
    let totalPoints = 0;
    student.assignedGoals.forEach(g => {
      if (!g.completed || !g.completedAt) return;
      const cd = new Date(g.completedAt);
      const key = cd.toISOString().slice(0, 10);
      if (!map.has(key)) return;
      const mg = masterGoals.find(m => m.id === g.goalId);
      const pts = mg?.points || 0;
      const cur = map.get(key)!;
      cur.goals += 1;
      cur.points += pts;
      totalGoals += 1;
      totalPoints += pts;
    });

    const rows = Array.from(map.entries()).map(([date, v]) => {
      const d = new Date(date);
      const label = compact
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : d.toLocaleDateString(undefined, { weekday: 'short' });
      return { date: label, goals: v.goals, points: v.points };
    });
    return { rows, totalGoals, totalPoints, days };
  }, [student?.assignedGoals, masterGoals, timelineFilterValue]);

  const historicalData = React.useMemo(() => {
    if (!student?.assignedGoals || student.assignedGoals.length === 0) return [];

    // Some older completed goals might not have completedAt.
    // Space them out hourly backwards from now so they show up beautifully on the chart.
    const now = Date.now();
    const zeroCount = student.assignedGoals.filter(g => g.completed && !g.completedAt).length;
    let baseTime = now - (zeroCount * 3600000);

    const completedGoals = student.assignedGoals
      .filter(g => g.completed)
      .map(g => ({ ...g, timestamp: g.completedAt ? new Date(g.completedAt).getTime() : 0 }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(g => {
        if (g.timestamp === 0) {
          baseTime += 3600000;
          return { ...g, timestamp: baseTime };
        }
        return g;
      });

    // Filter to active range; pick chart granularity automatically based on span.
    const range: DateRange = historyFilterValue.range;
    const inRange = completedGoals.filter(g => isWithinRange(g.timestamp, range));

    // Determine the visible span so we can choose label granularity.
    const firstTs = inRange[0]?.timestamp ?? completedGoals[0]?.timestamp ?? Date.now();
    const lastTs  = inRange[inRange.length - 1]?.timestamp ?? completedGoals[completedGoals.length - 1]?.timestamp ?? Date.now();
    const spanStart = range.start ? range.start.getTime() : firstTs;
    const spanEnd   = range.end ? range.end.getTime() : lastTs;
    const spanDays = Math.max(1, (spanEnd - spanStart) / 86400000);

    type Granularity = 'hours' | 'days' | 'weeks' | 'months' | 'years';
    const granularity: Granularity =
      spanDays <= 2     ? 'hours'  :
      spanDays <= 60    ? 'days'   :
      spanDays <= 180   ? 'weeks'  :
      spanDays <= 1095  ? 'months' :
                          'years';

    const labelFor = (date: Date): string => {
      if (granularity === 'hours')  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`;
      if (granularity === 'days')   return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
      if (granularity === 'weeks') {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDays = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
        return `W${weekNumber} ${date.getFullYear()}`;
      }
      if (granularity === 'months') {
        const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${m[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
      }
      return `${date.getFullYear()}`;
    };

    // Cumulative running total across goals in range.
    let runningTotal = 0;
    const historyMap = new Map<string, number>();
    inRange.forEach(g => {
      const mg = masterGoals.find(m => m.id === g.goalId);
      runningTotal += (mg?.points || 0);
      historyMap.set(labelFor(new Date(g.timestamp)), runningTotal);
    });

    const data = Array.from(historyMap.entries()).map(([date, points]) => ({ date, points }));
    if (data.length > 0 && data[0].points > 0) {
      data.unshift({ date: 'Start', points: 0 });
    }
    return data;
  }, [student?.assignedGoals, masterGoals, historyFilterValue]);

  if (!student) return <div className="text-center py-20 font-bold text-text-light underline cursor-pointer" onClick={() => navigateTo('/')}>Go Back Home</div>;

  const totalPoints = calculateTotalPoints(student.assignedGoals);
  const rankedStudents = [...students].map(s => ({...s, totalPts: calculateTotalPoints(s.assignedGoals || [])})).sort((a,b) => b.totalPts - a.totalPts);
  const currentRankIndex = rankedStudents.findIndex(s => s.id === studentId);
  const currentRank = currentRankIndex >= 0 ? currentRankIndex + 1 : 0;
  
  // Group goals by category
  const groupedGoals = categories.reduce((acc, cat) => {
    const goalsInCat = (student.assignedGoals || [])
      .map(ag => {
        const goalData = masterGoals.find(mg => mg.id === ag.goalId);
        if (goalData?.categoryId === cat.id) return { ...ag, ...goalData };
        return null;
      })
      .filter(Boolean) as (AssignedGoal & MasterGoal)[];
    
    if (goalsInCat.length > 0) acc[cat.id] = goalsInCat;
    return acc;
  }, {} as Record<string, (AssignedGoal & MasterGoal)[]>);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigateTo('/')} className="flex items-center gap-2 text-text-light hover:text-primary-600 transition-colors font-bold text-xs uppercase tracking-[0.2em] mb-4">
        <ArrowLeft className="h-4 w-4" /> Return to Board
      </button>

      <div className="bg-base-100 rounded-[2.5rem] p-8 shadow-xl border border-base-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary-600 group-hover:h-36 transition-all duration-500"></div>
        <div className="relative z-10 flex flex-col items-center text-center mt-8">
          <div className="relative">
            <ImageFallback src={student.photo || dicebearAvatar(student.name)} alt={student.name} variant="avatar" className="w-32 h-32 rounded-[2rem] border-8 border-base-100 bg-base-100 object-cover" wrapperClassName="w-32 h-32 rounded-[2rem] shadow-2xl" />
            <div className="absolute -bottom-2 -right-2 bg-accent-500 p-2 rounded-xl text-base-50 shadow-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <h1 className="text-3xl font-black text-text-main leading-tight">{student.name}</h1>
            <p className="text-text-muted text-sm max-w-md mx-auto italic">"{student.bio}"</p>
          </div>
          
          <div className="flex gap-4 mt-8 w-full">
            <div className="flex-1 bg-base-50 rounded-2xl p-4 border border-base-200 flex flex-col justify-center relative">
              <div className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Rank</div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-2xl font-black text-primary-600">#{currentRank}</div>
                <RankMovement currentRank={currentRank} previousRank={student.previousRank} />
              </div>
            </div>
            <div className="flex-1 bg-primary-600 rounded-2xl p-4 shadow-lg shadow-primary-200">
              <div className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">{POINTS_CAPTION.ALL_TIME}</div>
              <div className="text-2xl font-black text-base-50">{totalPoints}</div>
            </div>
          </div>
        </div>
      </div>

      {historicalData.length > 0 && (
        <div className="bg-base-100 rounded-3xl border border-base-200 p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h4 className="font-bold text-text-main flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" /> Progression History
            </h4>
            <TimeRangeFilter value={historyFilterValue} onChange={setHistoryFilterValue} />
          </div>
          <div className="h-48 w-full min-w-0" style={{ minHeight: "192px" }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
              <LineChart data={historicalData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={30} tickFormatter={value => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: 'var(--theme-accent-500)', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="points" stroke="var(--theme-accent-500)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-base-100 rounded-3xl border border-base-200 p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h4 className="font-bold text-text-main flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-accent-500" /> Activity Timeline
          </h4>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-light">
              <span className="px-2 py-1 rounded-lg bg-base-50 border border-base-200">
                {timelineData.totalGoals} goals
              </span>
              <span className="px-2 py-1 rounded-lg bg-base-50 border border-base-200">
                {timelineData.totalPoints} pts
              </span>
            </div>
            <TimeRangeFilter value={timelineFilterValue} onChange={setTimelineFilterValue} />
          </div>
        </div>
        <p className="text-xs text-text-muted mb-3">
          Daily completed goals — useful to validate weekly &amp; monthly leaderboard rankings.
        </p>
        <div className="h-48 w-full min-w-0" style={{ minHeight: "192px" }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <BarChart data={timelineData.rows}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={timelineData.days > 14 ? Math.ceil(timelineData.days / 10) : 0}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any, name: any) => [value, name === 'goals' ? 'Goals' : 'Points']}
              />
              <Bar dataKey="goals" fill="var(--theme-accent-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black text-text-main flex items-center gap-2 px-2">
          <Target className="w-6 h-6 text-primary-500" /> Assignment Board
        </h2>
        
        {Object.keys(groupedGoals).length === 0 ? (
          <div className="bg-base-100 rounded-3xl border border-base-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-base-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-text-light" />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">No Goals Yet</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto">This student hasn't been assigned any learning goals. Head to the Admin panel to assign their first track.</p>
          </div>
        ) : (
          Object.entries(groupedGoals).map(([catId, goals]) => {
            const category = categories.find(c => c.id === catId);
            const isExpanded = !!expandedCategories[catId];
            const completedCount = goals.filter(g => g.completed).length;
            const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

            return (
              <div key={catId} className="bg-base-100 rounded-3xl border border-base-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleCategory(catId)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-base-50 transition-colors"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className={`p-3 rounded-xl ${isExpanded ? 'bg-primary-600 text-base-50' : 'bg-base-50 text-text-light'}`}>
                      <FolderTree className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-text-main line-clamp-2 break-words leading-tight mb-1" title={category?.name}>{category?.name}</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-accent-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-text-light uppercase tracking-widest min-w-[3rem] text-right">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-text-light shrink-0" /> : <ChevronDown className="h-5 w-5 text-text-light shrink-0" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-base-200/50 border-t border-base-200"
                    >
                      <div className="p-4 space-y-3">
                        {goals.map(goal => (
                          <div key={goal.id} className="flex items-center gap-4 bg-base-100 p-4 rounded-2xl border border-base-200 shadow-sm transition-all hover:border-primary-100 relative overflow-hidden">
                            {/* Accent line for completed goals */}
                            {goal.completed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />}
                            
                            <div className={`shrink-0 z-10 ${goal.completed ? 'text-accent-500' : 'text-text-light'}`}>
                              {goal.completed ? <CheckCircle2 className="w-6 h-6 fill-accent-50" /> : <Circle className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 min-w-0 z-10">
                              <h4 
                                className={`text-[clamp(0.875rem,3.5vw,1rem)] font-bold line-clamp-2 break-words leading-tight ${goal.completed ? 'text-text-muted line-through decoration-slate-300' : 'text-text-main'}`}
                                title={goal.title}
                              >
                                {goal.title}
                              </h4>
                              <p 
                                className="text-[clamp(0.65rem,2.5vw,0.75rem)] text-text-muted line-clamp-2 break-words mt-1" 
                                title={goal.description}
                              >
                                {goal.description}
                              </p>
                            </div>
                            <div className={`text-xs font-black z-10 px-2 py-1 rounded-lg ${goal.completed ? 'text-accent-600 bg-accent-50' : 'text-primary-600 bg-primary-50 border border-primary-100/50'}`}>
                              +{goal.points !== undefined ? goal.points : (goal as any).pointValue || 0} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
