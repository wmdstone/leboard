import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, Medal, Crown, Flame, Loader2 } from 'lucide-react';
import { StudentSearchAdvanced } from '../StudentSearchAdvanced';
import { trackEvent } from '../../lib/analytics';
import { ImageFallback, dicebearAvatar } from '../ImageFallback';
import { ActionMenu } from '../ui/ActionMenu';
import { ConfirmModal } from '../ui/ConfirmModal';
import { RankMovement } from '../ui/RankMovement';
import type { Student, MasterGoal, AssignedGoal, Category } from '../../lib/types';
import { TIME_RANGE, TIME_RANGE_OPTIONS, type TimeRange } from '../../lib/timeRanges';
import { TimeRangeFilter, createDefaultTimeRangeValue, type TimeRangeValue } from '../TimeRangeFilter';
import { StudentSearchFilter, applyStudentSearchFilter, emptyStudentSearchFilter, type StudentSearchFilterValue } from '../StudentSearchFilter';
import { StudentSortDropdown, sortStudents, type SortKey } from '../StudentSortDropdown';

export // --- LEADERBOARD PAGE ---
function LeaderboardPage({ students, masterGoals, calculateTotalPoints, navigateTo, isLoading, appSettings }: {
  students: Student[]; 
  masterGoals: MasterGoal[];
  calculateTotalPoints: (goals: AssignedGoal[]) => number; 
  navigateTo: (path: string, params?: any) => void;
  isLoading: boolean;
  appSettings?: any;
}) {
  const [timeFilter, setTimeFilter] = useState<TimeRange>(TIME_RANGE.ALL_TIME);
  const [searchFilter, setSearchFilter] = useState<StudentSearchFilterValue>(emptyStudentSearchFilter);
  const [sortKey, setSortKey] = useState<SortKey>('points');

  const sortedStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    const now = new Date();
    
    // Boundaries setup
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Monday 00:00 boundary for Weekly
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day; 
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const filterGoals = (goals: AssignedGoal[]) => {
      if (!goals || !Array.isArray(goals)) return [];
      
      return goals.filter(g => {
        if (!g.completed) return false;
        
        // "all-time" includes all completed goals regardless of date
        if (timeFilter === TIME_RANGE.ALL_TIME) return true;
        
        // "Monthly" and "Weekly" require completedAt to check boundaries
        if (!g.completedAt) return false;
        
        const completionDate = new Date(g.completedAt);
        const compTime = completionDate.getTime();
        
        // Robust check for invalid date
        if (isNaN(compTime)) return false;
        
        if (timeFilter === TIME_RANGE.MONTHLY) {
          return compTime >= startOfMonth.getTime();
        }
        if (timeFilter === TIME_RANGE.WEEKLY) {
          return compTime >= startOfWeek.getTime();
        }
        return false;
      });
    };

    const studentsWithPoints = students.map(student => {
      const filteredGoals = filterGoals(student.assignedGoals || []);
      
      // Calculate points internally for maximum reliability and to avoid stale closures
      const totalPoints = filteredGoals.reduce((total, assigned) => {
        const goalData = masterGoals.find(mg => String(mg.id) === String(assigned.goalId));
        if (goalData) {
          const pts = goalData.points !== undefined ? goalData.points : (goalData as any).pointValue || (goalData as any).pts || 0;
          const numPts = typeof pts === 'number' ? pts : parseInt(String(pts), 10);
          return total + (isNaN(numPts) ? 0 : numPts);
        }
        return total;
      }, 0);
      
      // Secondary Sort: Most recently achieved points comes first
      const lastCompletion = filteredGoals.reduce((max, g) => {
        if (!g.completedAt) return max;
        const compTime = new Date(g.completedAt).getTime();
        return isNaN(compTime) ? max : (compTime > max ? compTime : max);
      }, 0);

      return {
        ...student,
        totalPoints,
        lastCompletion
      };
    });

    return [...studentsWithPoints].sort((a, b) => {
      // Primary Sort: Total points descending
      const ptsA = a.totalPoints || 0;
      const ptsB = b.totalPoints || 0;
      if (ptsB !== ptsA) {
        return ptsB - ptsA;
      }
      // Secondary Sort: Recent achievement (as per "baru sampai lama" request)
      return (b.lastCompletion || 0) - (a.lastCompletion || 0);
    });
  }, [students, masterGoals, calculateTotalPoints, timeFilter]);

  const top3 = [sortedStudents[1], sortedStudents[0], sortedStudents[2]];
  const restOfStudentsRaw = sortedStudents.slice(3);
  const restOfStudents = useMemo(() => {
    const filtered = applyStudentSearchFilter(restOfStudentsRaw, searchFilter);
    // Default leaderboard ordering is points-desc and is already produced upstream;
    // only re-sort when the user picks a different key.
    return sortKey === 'points' ? filtered : sortStudents(filtered, sortKey);
  }, [restOfStudentsRaw, searchFilter, sortKey]);
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach((s) => (s.tags || []).forEach((t) => t && set.add(t)));
    return Array.from(set);
  }, [students]);
  const studentTagSource = useMemo(
    () => (students || []).map((s) => s.tags || []),
    [students]
  );
  const hasActiveFilter = !!(searchFilter.query || searchFilter.tags.length > 0);

  // Mocking "My Rank": User yang sedang login (Demo purpose, taking first student)
  const currentLoggedInStudentId = students[0]?.id;
  const myRankIndex = sortedStudents.findIndex(s => s.id === currentLoggedInStudentId);
  const myRankData = myRankIndex !== -1 ? sortedStudents[myRankIndex] : null;

  const renderPodiumStudent = (student: any, position: 'middle'|'left'|'right', idx: number) => {
    if (!student) return <div className="w-1/3 opacity-0" key={`empty-${position}`} />;
    
    const config = {
      middle: { rank: 1, height: 'h-40 md:h-48', avatarSize: 'w-24 h-24 md:w-32 md:h-32', border: 'border-yellow-400', crown: <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-md" />, delay: 0 },
      left: { rank: 2, height: 'h-28 md:h-32', avatarSize: 'w-16 h-16 md:w-20 md:h-20', border: 'border-slate-300', crown: <Medal className="w-6 h-6 md:w-8 md:h-8 text-slate-400 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-md" />, delay: 0.1 },
      right: { rank: 3, height: 'h-24 md:h-28', avatarSize: 'w-16 h-16 md:w-20 md:h-20', border: 'border-orange-400', crown: <Medal className="w-6 h-6 md:w-8 md:h-8 text-orange-500 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-md" />, delay: 0.2 },
    }[position];

    return (
      <motion.div 
        key={`${student.id}-${timeFilter}`}
        initial={{ opacity: 0, y: 30, scale: 0.9 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 15,
          delay: config.delay 
        }}
        className="flex flex-col items-center justify-end w-1/3 px-1 md:px-2 pt-6"
      >
        <div className="relative mb-2 flex flex-col items-center">
          {config.crown}
          <ImageFallback 
            src={student.photo} 
            alt={student.name} 
            variant="avatar" 
            className={`${config.avatarSize} rounded-full object-cover border-[3px] md:border-4 ${config.border} bg-base-100 relative z-10 cursor-pointer`} 
            wrapperClassName={`${config.avatarSize} relative z-10 rounded-full shadow-lg`}
            onClick={() => {
              trackEvent('profile_open', { refId: student.id, metadata: { source: 'podium' } });
              navigateTo('/student', { id: student.id });
            }}
          />
          <div className="absolute -bottom-2 md:-bottom-3 bg-base-900 text-white text-[10px] md:text-sm font-black px-2 md:px-3 py-0.5 rounded-full border-2 border-base-100 z-20 shadow-sm">
            #{config.rank}
          </div>
        </div>
        <div className="text-center w-full mt-2 md:mt-3 px-1">
          <h4 className="font-bold text-base-50 text-xs md:text-sm line-clamp-2 md:line-clamp-3 break-words leading-tight" title={student.name}>{student.name}</h4>
          <p className="text-[10px] md:text-xs font-black text-primary-200 mt-0.5">{student.totalPoints} pts</p>
        </div>
        <div className={`w-full ${config.height} bg-gradient-to-t from-primary-400/20 to-primary-100/10 mt-3 rounded-t-xl md:rounded-t-2xl border-t-[3px] ${config.border} shadow-inner backdrop-blur-sm`} />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER & PODIUM */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 pt-8 px-4 rounded-b-[2.5rem] md:rounded-[2.5rem] text-base-50 shadow-2xl relative overflow-hidden -mx-4 -mt-6 sm:mx-0 sm:mt-0">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 rotate-12 pointer-events-none">
          {appSettings?.logoUrl ? <ImageFallback src={appSettings.logoUrl} alt="" variant="logo" className="w-64 h-64 opacity-50 grayscale" wrapperClassName="w-64 h-64" /> : <Trophy className="w-64 h-64" />}
        </div>
        
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-base-100/10 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <Flame className="w-3 h-3 text-accent-500" /> {appSettings?.badgeTitle || 'Season 2 Active'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{appSettings?.heroTitle || 'Student Ranking'}</h1>
          <p className="text-base-50 drop-shadow-sm font-medium max-w-lg mx-auto text-sm md:text-base opacity-95 leading-relaxed">
            {appSettings?.heroSubtitle || 'Witness the rise of champions. Progress is tracked daily.'}
          </p>
          
          {/* HORIZONTAL TIME FILTERS */}
          <div className="flex justify-center mt-6">
            <div className="bg-base-900/30 backdrop-blur-md p-1.5 rounded-full flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-hide snap-x">
               {TIME_RANGE_OPTIONS.map((opt) => (
                 <button 
                  key={opt.value} 
                  onClick={() => {
                    setTimeFilter(opt.value);
                    trackEvent('leaderboard_filter', { metadata: { range: opt.value } });
                  }}
                  className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all snap-center whitespace-nowrap active:scale-95 ${
                    timeFilter === opt.value ? 'bg-base-50 text-primary-700 shadow-md' : 'text-base-50/90 hover:text-base-50 hover:bg-base-50/20'
                  }`}
                 >
                   {opt.shortLabel}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* TOP 3 PODIUM */}
        <div className="relative z-10 flex items-end justify-center max-w-3xl mx-auto px-2 mt-8">
          {renderPodiumStudent(top3[0], 'left', 1)}
          {renderPodiumStudent(top3[1], 'middle', 0)}
          {renderPodiumStudent(top3[2], 'right', 2)}
        </div>
      </div>

      {/* REST OF STUDENTS LIST */}
      <div className="bg-base-100 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-base-200 overflow-hidden mx-0">
        <div className="px-4 md:px-8 pt-6 pb-2">
          <StudentSearchAdvanced
            value={searchFilter}
            onChange={setSearchFilter}
            sortKey={sortKey}
            onSortChange={setSortKey}
            availableTags={availableTags}
            studentTagSource={studentTagSource}
            placeholder="Search rank 4 and below..."
          />
        </div>
        {isLoading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-text-light text-sm font-medium">Fetching leaderboard data...</p>
          </div>
        ) : restOfStudents.length === 0 ? (
          <div className="p-12 text-center text-text-light">
            <p className="font-bold">
              {hasActiveFilter ? 'No students match your search or tag filter.' : 'No other students found.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {restOfStudents.map((student, index) => {
              const rank = index + 4; // Because top 3 are extracted
              
              return (
                <li 
                  key={student.id || `leader-${index}`} 
                  onClick={() => {
                    trackEvent('profile_open', { refId: student.id, metadata: { source: 'leaderboard' } });
                    navigateTo('/student', { id: student.id });
                  }}
                  className="flex items-center gap-3 md:gap-4 py-5 px-4 md:px-8 hover:bg-primary-50/30 transition-all cursor-pointer group active:scale-[0.99] bg-base-100"
                >
                  <div className="flex flex-col items-center gap-1 w-8 md:w-10">
                    <div className="font-black text-lg md:text-xl text-text-light group-hover:text-primary-600 transition-colors">
                      {rank}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <ImageFallback src={student.photo} alt={student.name} variant="avatar" className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-base-200 object-cover" wrapperClassName="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full shadow-sm" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 
                      className="font-bold text-text-main group-hover:text-primary-600 transition-colors text-[clamp(0.95rem,4vw,1.1rem)] line-clamp-2 md:line-clamp-3 leading-tight break-words"
                      title={student.name}
                    >
                      {student.name}
                    </h3>
                    <p 
                      className="text-[clamp(0.7rem,3vw,0.75rem)] text-text-muted line-clamp-2 md:line-clamp-3 break-words mt-0.5 max-w-full"
                      title={student.bio}
                    >
                      {student.bio}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 text-right">
                    <div className="flex flex-col items-end justify-center">
                      <div className="text-xl md:text-2xl font-black text-text-main group-hover:text-primary-700 transition-colors">{student.totalPoints}</div>
                      <div className="text-[9px] md:text-[10px] font-bold text-text-light uppercase tracking-widest leading-none">Points</div>
                    </div>
                    <RankMovement currentRank={rank} previousRank={student.previousRank} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>


    </div>
  );
}
