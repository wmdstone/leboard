import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Camera, Image as ImageIcon, Save, Trash2, Edit2, Info, Loader2, Link as LinkIcon, Download, X, Search, Filter, ArrowUpAZ, ArrowDownAZ, TrendingUp, Plus, CheckSquare, Square, CheckCircle2, ArrowLeft, ZoomOut, ZoomIn } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../lib/api';
import { useUpdateStudentMutation } from '../../hooks/useAppQueries';
import ImageFallback from '../ImageFallback';
import { StudentSearchFilter } from '../StudentSearchFilter';
import { applyStudentSearchFilter, emptyStudentSearchFilter } from '../StudentSearchFilter';
import { StudentSearchAdvanced } from '../StudentSearchAdvanced';
import { StudentSortDropdown, sortStudents, SortKey } from '../StudentSortDropdown';
import { dicebearAvatar } from '../ImageFallback';
import { ActionMenu } from '../ui/ActionMenu';
import { ConfirmModal } from '../ui/ConfirmModal';
import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';
import { TimeRangeValue } from '../TimeRangeFilter';
import { StudentSearchFilterValue } from '../StudentSearchFilter';

export function AdminStudentsTab({ students, refreshData, masterGoals, categories, calculateTotalPoints }: any) {
  const [searchFilter, setSearchFilter] = useState<StudentSearchFilterValue>(emptyStudentSearchFilter);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const updateStudentMutation = useUpdateStudentMutation();

  const studentsList = Array.isArray(students) ? students : [];
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    studentsList.forEach((s: any) => (s.tags || []).forEach((t: string) => t && set.add(t)));
    return Array.from(set);
  }, [studentsList]);
  const studentTagSource = useMemo(
    () => studentsList.map((s: any) => s.tags || []),
    [studentsList]
  );
  const filtered = useMemo(() => {
    const matched = applyStudentSearchFilter(studentsList, searchFilter);
    // Precompute totalPoints so 'points' sort works against the live goal data.
    const enriched = matched.map((s: any) => ({
      ...s,
      totalPoints: calculateTotalPoints(s.assignedGoals || []),
    }));
    return sortStudents(enriched, sortKey);
  }, [studentsList, searchFilter, sortKey, calculateTotalPoints]);

  const handleSave = async (formData: any) => {
    // 1. Calculate old ranks for all students
    const calculateRanks = (list: any[]) => {
      const mapped = list.map(s => ({ ...s, totalPts: calculateTotalPoints(s.assignedGoals || []) }));
      mapped.sort((a,b) => b.totalPts - a.totalPts);
      return mapped.map((s, index) => ({ id: s.id, rank: index + 1 }));
    };
    
    const oldRanks = calculateRanks(studentsList);
    const oldRanksMap = Object.fromEntries(oldRanks.map(r => [r.id, r.rank]));

    const isNew = !formData.id;
    const url = isNew ? '/api/students' : `/api/students/${formData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    // To be perfectly accurate, we update old rank into the formData BEFORE saving.
    let finalData = { ...formData };
    if (!isNew && oldRanksMap[formData.id]) {
        finalData.previousRank = oldRanksMap[formData.id];
    }

    try {
      await updateStudentMutation.mutateAsync({ id: formData.id, data: finalData });
      setModalOpen(false);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await apiFetch(`/api/students/${deleteConfirm.id}`, { method: 'DELETE' });
    if (!res.ok) alert(`Failed to delete: ${res.statusText}`);
    setDeleteConfirm(null);
    refreshData();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-text-main underline decoration-primary-500 decoration-4 underline-offset-8">Student List</h3>
          <p className="text-text-muted text-sm mt-3">Manage profile and goal assignments.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={async () => {
              const baseC = confirm('Are you sure you want to snapshot current ranks? This will freeze the current leader positions to calculate rank changes.');
              if(!baseC) return;
              try {
                const res = await apiFetch('/api/students/snapshot-ranks', { method: 'POST' });
                if(res.ok) {
                  alert('Ranks successfully snapshotted. Rank changes (up/down arrows) will now appear on the leaderboard when students gain points.');
                  refreshData();
                } else alert('Failed to snapshot ranks');
              } catch(e) { console.error(e); }
            }}
            className="bg-accent-500 text-base-50 px-6 py-3 rounded-2xl text-sm font-black hover:bg-accent-600 shadow-lg shadow-accent-100 flex justify-center items-center gap-2 active:scale-95 transition-all w-full sm:w-auto"
            title="Saves current ranks so you can track movement (up/down)"
          >
            <TrendingUp className="h-4 w-4" /> Snapshot Ranks
          </button>
          <button onClick={() => { setEditData(null); setModalOpen(true); }} className="bg-primary-600 text-base-50 px-6 py-3 rounded-2xl text-sm font-black hover:bg-primary-700 shadow-lg shadow-primary-100 flex items-center gap-2 active:scale-95 transition-all w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="mb-6">
        <StudentSearchAdvanced
          value={searchFilter}
          onChange={setSearchFilter}
          sortKey={sortKey}
          onSortChange={setSortKey}
          availableTags={availableTags}
          studentTagSource={studentTagSource}
          placeholder="Search students..."
        />
      </div>

      <div className="space-y-3">
        {filtered.map((s: any, index: number) => (
          <div key={s.id || `student-${index}`} className="flex items-center gap-4 p-4 rounded-2xl border border-base-200 bg-base-100 hover:border-primary-200 transition-colors shadow-sm">
            <ImageFallback src={s.photo} alt={s.name} variant="avatar" className="w-12 h-12 rounded-xl bg-base-200 object-cover" wrapperClassName="w-12 h-12 shrink-0 rounded-xl" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-text-main line-clamp-2 break-words leading-tight" title={s.name}>{s.name}</h4>
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mt-1 mb-1">{s.assignedGoals.length} Handled Goals</p>
              {s.tags && s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <span key={idx} className="bg-primary-100/50 text-text-muted text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center break-all">
                      {tag}
                    </span>
                  ))}
                  {s.tags.length > 3 && (
                    <span className="bg-base-200 text-text-light text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center">
                      +{s.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <ActionMenu 
                onEdit={() => { setEditData(s); setModalOpen(true); }}
                onDelete={() => setDeleteConfirm(s)}
              />
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <StudentAdminModal 
          student={editData} 
          masterGoals={masterGoals} 
          categories={categories} 
          onClose={() => setModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
      
      <ConfirmModal 
        isOpen={!!deleteConfirm}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

// Student Edit Modal (Shared with initial but updated styles)
function StudentAdminModal({ student, masterGoals, categories, onClose, onSave }: any) {
  const [formData, setFormData] = useState<Student>({
    id: student?.id || '',
    name: student?.name || '',
    bio: student?.bio || '',
    photo: student?.photo || dicebearAvatar(student?.name || student?.id || 'student'),
    tags: student?.tags ? [...student.tags] : [],
    assignedGoals: student?.assignedGoals ? [...student.assignedGoals] : []
  });

  const [filterCat, setFilterCat] = useState('ALL');
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CROPPING STATE ---
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImage(event.target?.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const confirmCrop = () => {
    if (!cropImage || !croppedAreaPixels) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 512;
      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          image,
          croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
          0, 0, MAX_SIZE, MAX_SIZE
        );
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
        setFormData(prev => ({ ...prev, photo: compressedDataUrl }));
        setCropImage(null);
      }
    };
    image.src = cropImage;
  };

  const addTag = () => {
    if (tagInput.trim() !== '' && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
  };

  const displayedMasterGoals = filterCat === 'ALL' 
    ? masterGoals 
    : masterGoals.filter((mg: any) => mg.categoryId === filterCat);

  const isAssigned = (goalId: string) => formData.assignedGoals.some(ag => ag.goalId === goalId);
  const isCompleted = (goalId: string) => formData.assignedGoals.find(ag => ag.goalId === goalId)?.completed || false;

  const toggleAssignment = (goalId: string) => {
    setFormData(prev => {
      if (isAssigned(goalId)) {
        return { ...prev, assignedGoals: prev.assignedGoals.filter(ag => ag.goalId !== goalId) };
      } else {
        return { ...prev, assignedGoals: [...prev.assignedGoals, { goalId, completed: false }] };
      }
    });
  };

  const toggleCompletion = (goalId: string) => {
    if (!isAssigned(goalId)) return;
    setFormData(prev => ({
      ...prev,
      assignedGoals: prev.assignedGoals.map(ag => ag.goalId === goalId ? { ...ag, completed: !ag.completed, completedAt: !ag.completed ? new Date().toISOString() : undefined } : ag)
    }));
  };

  // ── Bulk track-scoped actions ──────────────────────────────────────────────
  // Operate on whatever is currently visible in the goal list (respects the
  // "All Tracks" / specific-track filter at the top of the panel).
  const visibleGoalIds: string[] = displayedMasterGoals.map((mg: any) => mg.id);
  const visibleAssignedCount = visibleGoalIds.filter(id => isAssigned(id)).length;
  const visibleCompletedCount = visibleGoalIds.filter(id => isCompleted(id)).length;
  const allVisibleAssigned = visibleGoalIds.length > 0 && visibleAssignedCount === visibleGoalIds.length;
  const allVisibleCompleted = visibleAssignedCount > 0 && visibleCompletedCount === visibleAssignedCount;
  const scopeLabel = filterCat === 'ALL'
    ? 'all tracks'
    : (categories.find((c: any) => c.id === filterCat)?.name || 'this track');

  const bulkSetAssigned = (assign: boolean) => {
    setFormData(prev => {
      if (assign) {
        const existingIds = new Set(prev.assignedGoals.map(ag => ag.goalId));
        const additions = visibleGoalIds
          .filter(id => !existingIds.has(id))
          .map(id => ({ goalId: id, completed: false }));
        if (additions.length === 0) return prev;
        return { ...prev, assignedGoals: [...prev.assignedGoals, ...additions] };
      }
      // Unassign: drop everything in scope (also clears their completion).
      const drop = new Set(visibleGoalIds);
      return { ...prev, assignedGoals: prev.assignedGoals.filter(ag => !drop.has(ag.goalId)) };
    });
  };

  const bulkSetCompleted = (complete: boolean) => {
    setFormData(prev => {
      const scope = new Set(visibleGoalIds);
      const nowIso = new Date().toISOString();
      let next = prev.assignedGoals.map(ag => {
        if (!scope.has(ag.goalId)) return ag;
        if (complete) {
          return ag.completed ? ag : { ...ag, completed: true, completedAt: ag.completedAt || nowIso };
        }
        return { ...ag, completed: false, completedAt: undefined };
      });
      // When marking complete, auto-assign any visible goals that weren't yet assigned.
      if (complete) {
        const existingIds = new Set(next.map(ag => ag.goalId));
        const additions = visibleGoalIds
          .filter(id => !existingIds.has(id))
          .map(id => ({ goalId: id, completed: true, completedAt: nowIso }));
        if (additions.length) next = [...next, ...additions];
      }
      return { ...prev, assignedGoals: next };
    });
  };

  return (
    <div className="fixed inset-0 bg-base-900/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
       <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-base-100 rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative"
      >
        <div className="flex justify-between items-center p-6 border-b border-base-200">
          <h2 className="text-xl font-black text-text-main">{student ? 'Edit Credentials' : 'Enroll Student'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-base-200 rounded-xl transition-colors"><X className="h-6 w-6 text-text-light" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
          {/* Biodata */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="text-center">
               <div className="relative inline-block group">
                <ImageFallback src={formData.photo} alt="Avatar" variant="avatar" className="w-32 h-32 rounded-[2rem] border-4 border-slate-50 bg-base-200 shadow-md object-cover" wrapperClassName="w-32 h-32" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-900/60 p-3 rounded-full text-base-50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-xl" title="Upload Photo">
                  <ImageIcon className="w-6 h-6" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                <button type="button" onClick={() => setFormData(p => ({...p, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.floor(Math.random()*1000)}&backgroundColor=d1d4f9`}))} className="absolute -bottom-2 -right-2 bg-primary-600 p-2 rounded-xl text-base-50 shadow-lg active:scale-90 transition-transform">
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mt-3">Profile Identity</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Photo URL (Optional)</label>
                <input type="text" className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" placeholder="Paste image URL here" value={formData.photo} onChange={e => setFormData(p => ({...p, photo: e.target.value}))}/>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Full Name</label>
                <input type="text" className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))}/>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Short Bio</label>
                <textarea rows={2} className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" value={formData.bio} onChange={e => setFormData(p => ({...p, bio: e.target.value}))}/>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Tags (Multi-tags for Search)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, idx) => (
                    <span key={idx} className="bg-primary-100 text-primary-800 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      {tag} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" 
                  placeholder="Type a tag & press Enter" 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                />
              </div>
            </div>
          </div>

          {/* Goal Selector */}
          <div className="flex-1 border-base-200 lg:border-l lg:pl-8 pt-8 lg:pt-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
              <div>
                <h3 className="text-lg font-black text-text-main">Track Assigments</h3>
                <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none mt-1">Configure goals for this student</p>
              </div>
              <select className="bg-base-200 border-none rounded-xl p-2 text-xs font-bold text-text-muted focus:ring-2 focus:ring-primary-100" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="ALL">All Tracks</option>
                {categories.map((c: any, index: number) => <option key={c.id || `cp1-${index}`} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Bulk actions for the current track scope */}
            {visibleGoalIds.length > 0 && (
              <div className="mb-4 p-3 rounded-2xl bg-base-50 border border-base-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-text-light">
                  Bulk on <span className="text-primary-600">{scopeLabel}</span>
                  <span className="ml-2 normal-case tracking-normal font-bold text-text-muted">
                    · {visibleAssignedCount}/{visibleGoalIds.length} assigned · {visibleCompletedCount} completed
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => bulkSetAssigned(!allVisibleAssigned)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all ${
                      allVisibleAssigned
                        ? 'bg-base-200 text-text-muted hover:bg-base-300'
                        : 'bg-primary-600 text-base-50 hover:bg-primary-700'
                    }`}
                    title={allVisibleAssigned ? 'Unassign all visible' : 'Assign all visible'}
                  >
                    {allVisibleAssigned ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                    {allVisibleAssigned ? 'Unassign all' : 'Assign all'}
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkSetCompleted(!allVisibleCompleted)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all ${
                      allVisibleCompleted
                        ? 'bg-base-200 text-text-muted hover:bg-base-300'
                        : 'bg-accent-500 text-base-50 hover:bg-accent-600'
                    }`}
                    title={allVisibleCompleted ? 'Unmark all completed' : 'Mark all completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {allVisibleCompleted ? 'Unmark all' : 'Mark all done'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 pb-4">
              {displayedMasterGoals.map((mg: any, index: number) => {
                const assigned = isAssigned(mg.id);
                const completed = isCompleted(mg.id);
                
                return (
                  <div key={mg.id || `mg-display-${index}`} className={`p-4 rounded-3xl border-2 transition-all ${
                    assigned 
                      ? completed ? 'border-accent-100 bg-accent-50/20' : 'border-primary-100 bg-primary-50/20' 
                      : 'border-slate-50 bg-base-100 hover:border-base-200 shadow-sm'
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-text-main">{mg.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{mg.points !== undefined ? mg.points : (mg as any).pointValue || 0} pts</span>
                          <span className="text-[10px] text-text-light">•</span>
                          <span className="text-[10px] font-medium text-text-light">{categories.find((c: any)=>c.id === mg.categoryId)?.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => toggleAssignment(mg.id)}
                          className={`p-2 rounded-xl transition-all ${assigned ? 'bg-primary-600 text-base-50' : 'bg-base-200 text-text-light'}`}
                        >
                          {assigned ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => toggleCompletion(mg.id)}
                          disabled={!assigned}
                          className={`p-2 rounded-xl transition-all ${!assigned ? 'opacity-20' : completed ? 'bg-accent-500 text-base-50' : 'bg-base-200 text-text-light'}`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-base-200 bg-base-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-text-light hover:text-text-main transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="bg-primary-600 px-8 py-3 rounded-2xl text-base-50 font-black shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">
            Confirm Changes
          </button>
        </div>

        {/* Cropper Overlay */}
        {cropImage && (
          <div className="absolute inset-0 bg-base-900 z-[100] flex flex-col mt-0 border-t-0 p-0 shadow-none">
            <div className="flex-1 relative">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 bg-base-900 border-t border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full sm:w-1/2">
                <ZoomOut className="text-slate-400 w-5 h-5 flex-shrink-0" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <ZoomIn className="text-slate-400 w-5 h-5 flex-shrink-0" />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setCropImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }} 
                  className="px-6 py-2 rounded-xl font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmCrop} 
                  className="bg-primary-600 px-6 py-2 rounded-xl text-white font-black hover:bg-primary-700 transition-colors"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

