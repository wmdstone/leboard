import React, { useState, useMemo } from 'react';
import { Target, ChevronUp, FolderTree, Info, Save, Trash2, Edit2, X, Plus, ChevronDown, ChevronRight, Tags } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionMenu } from '../ui/ActionMenu';
import { ConfirmModal } from '../ui/ConfirmModal';
import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';

export function AdminGoalsTab({ masterGoals, refreshData, categories }: any) {
  // Goal Modal States
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editGoalData, setEditGoalData] = useState<any>(null);
  const [deleteGoalConfirm, setDeleteGoalConfirm] = useState<any>(null);

  // Category States
  const [newCatName, setNewCatName] = useState('');
  const [editCatData, setEditCatData] = useState<any>(null);
  const [editCatName, setEditCatName] = useState('');
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<any>(null);

  // UI States
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- GOAL ACTIONS ---
  const handleSaveGoal = async (formData: any) => {
    const isNew = !formData.id;
    const url = isNew ? '/api/masterGoals' : `/api/masterGoals/${formData.id}`;
    const res = await apiFetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) alert(`Failed to save template: ${res.statusText}`);
    else { refreshData(); setGoalModalOpen(false); }
  };

  const executeDeleteGoal = async () => {
    if (!deleteGoalConfirm) return;
    const res = await apiFetch(`/api/masterGoals/${deleteGoalConfirm.id}`, { method: 'DELETE' });
    if (!res.ok) alert(`Failed to delete: ${res.statusText}`);
    setDeleteGoalConfirm(null); refreshData();
  };

  // --- CATEGORY ACTIONS ---
  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const res = await apiFetch('/api/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCatName })
    });
    if (!res.ok) alert(`Failed to create category: ${res.statusText}`);
    else { setNewCatName(''); refreshData(); }
  };

  const updateCategory = async () => {
    if (!editCatName.trim() || !editCatData) return;
    const res = await apiFetch(`/api/categories/${editCatData.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editCatName })
    });
    if (!res.ok) alert(`Failed to update category: ${res.statusText}`);
    else { setEditCatData(null); setEditCatName(''); refreshData(); }
  };

  const executeDeleteCategory = async () => {
    if (!deleteCatConfirm) return;
    const res = await apiFetch(`/api/categories/${deleteCatConfirm.id}`, { method: 'DELETE' });
    if (!res.ok) alert(`Failed to delete: ${res.statusText}`);
    setDeleteCatConfirm(null); refreshData();
  };

  // --- DATA PREP ---
  const groupedGoals = useMemo(() => {
    const groups: { [key: string]: { category: any, goals: any[] } } = {};
    const unknownCatId = 'unknown-cat';
    
    categories.forEach((c: any) => {
      groups[c.id] = { category: c, goals: [] };
    });
    groups[unknownCatId] = { category: { id: unknownCatId, name: 'Unknown Category', isSystem: true }, goals: [] };

    masterGoals.forEach((g: any) => {
      if (g.categoryId && groups[g.categoryId]) {
        groups[g.categoryId].goals.push(g);
      } else {
        groups[unknownCatId].goals.push(g);
      }
    });

    return Object.values(groups).filter(g => !g.category.isSystem || g.goals.length > 0);
  }, [categories, masterGoals]);

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-black text-text-main underline decoration-primary-500 decoration-4 underline-offset-8">Tracks & Goals</h3>
          <p className="text-text-muted text-sm mt-3">Manage categories and their goal templates.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <form 
            onSubmit={(e) => { e.preventDefault(); addCategory(); }} 
            className="flex items-center gap-2 bg-base-200 p-1.5 rounded-2xl border border-base-200"
          >
            <input 
              type="text" placeholder="New Track Name" value={newCatName} onChange={e => setNewCatName(e.target.value)}
              className="bg-transparent border-none px-4 py-2 text-sm font-bold focus:ring-0 w-48"
            />
            <button type="submit" className="bg-primary-600 text-base-50 p-2 rounded-xl hover:bg-primary-700 active:scale-95 transition-all">
              <Plus className="h-5 w-5" />
            </button>
          </form>
          <button onClick={() => { setEditGoalData(null); setGoalModalOpen(true); }} className="bg-primary-600 text-base-50 px-6 py-2 rounded-2xl text-sm font-black flex items-center gap-2 active:scale-95 shadow-md shadow-primary-500/20">
            <Target className="h-4 w-4" /> New Goal
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {groupedGoals.map((group) => {
          const isExpanded = expandedCats[group.category.id] !== false; // Default expanded
          const isSystem = group.category.isSystem;
          
          return (
            <div key={group.category.id} className="bg-base-200/30 border border-base-200 rounded-[2rem] relative">
              {/* Category Header */}
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-base-200/50 transition-colors ${isExpanded ? 'rounded-t-[2rem]' : 'rounded-[2rem]'}`}
                onClick={() => toggleCat(group.category.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {editCatData?.id === group.category.id ? (
                    <div className="flex flex-1 gap-2 items-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} autoFocus
                        className="bg-base-100 border border-base-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary-100"
                      />
                      <button onClick={updateCategory} className="bg-accent-500 text-base-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent-600">Save</button>
                      <button onClick={() => setEditCatData(null)} className="bg-base-200 text-text-muted px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-300">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 items-start ml-2">
                      <span className="font-black text-text-main">{group.category.name}</span>
                      <span className="text-text-light text-xs font-bold">{group.goals.length} goals</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!isSystem && editCatData?.id !== group.category.id && (
                    <div className="flex items-center mr-2" onClick={e => e.stopPropagation()}>
                      <ActionMenu 
                        onEdit={() => { setEditCatData(group.category); setEditCatName(group.category.name); }}
                        onDelete={() => setDeleteCatConfirm(group.category)}
                      />
                    </div>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-text-light" /> : <ChevronDown className="w-5 h-5 text-text-light" />}
                </div>
              </div>

              {/* Goals Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="p-4 pt-0 border-t border-base-200/50 bg-base-100/50 rounded-b-[2rem]">
                      {group.goals.length === 0 ? (
                        <p className="text-sm font-bold text-text-muted text-center py-8">No goals in this track.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {group.goals.map((mg: any) => (
                            <div key={mg.id} className="bg-base-100 p-5 rounded-[1.5rem] border border-base-200 shadow-sm space-y-3 group hover:border-primary-200 transition-colors">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-text-main leading-tight flex-1" title={mg.title}>{mg.title}</h4>
                                <div className="bg-base-200 px-2 py-1 rounded-lg text-xs font-black text-primary-600 ml-2 whitespace-nowrap">+{mg.points !== undefined ? mg.points : mg.pointValue || 0}</div>
                              </div>
                              <p className="text-xs text-text-muted italic leading-relaxed line-clamp-2" title={mg.description}>{mg.description}</p>
                              <div className="flex justify-end gap-1 pt-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionMenu 
                                  placement="top-center"
                                  onEdit={() => { setEditGoalData(mg); setGoalModalOpen(true); }}
                                  onDelete={() => setDeleteGoalConfirm(mg)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {goalModalOpen && <GoalAdminModal goal={editGoalData} categories={categories} onClose={() => setGoalModalOpen(false)} onSave={handleSaveGoal} />}
      
      <ConfirmModal 
        isOpen={!!deleteGoalConfirm} title="Delete Master Goal"
        message={`Are you sure you want to delete ${deleteGoalConfirm?.title}? Students will keep the reference but data won't sync.`}
        onConfirm={executeDeleteGoal} onCancel={() => setDeleteGoalConfirm(null)}
      />

      <ConfirmModal 
        isOpen={!!deleteCatConfirm} title="Delete Track"
        message={`Are you sure you want to delete ${deleteCatConfirm?.name}? Goals using this track will be moved to Unknown.`}
        onConfirm={executeDeleteCategory} onCancel={() => setDeleteCatConfirm(null)}
      />
    </div>
  );
}


// Goal Admin Modal (Internal usage)
function GoalAdminModal({ goal, categories, onClose, onSave }: any) {
  const [formData, setFormData] = useState<MasterGoal>({
    id: goal?.id || '',
    title: goal?.title || '',
    points: goal?.points || 10,
    categoryId: goal?.categoryId || categories[0]?.id || '',
    description: goal?.description || ''
  });

  return (
    <div className="fixed inset-0 bg-base-900/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
      <div className="bg-base-100 rounded-[2rem] shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-base-200 font-black text-lg">{goal ? 'Edit Template' : 'New Template'}</div>
        <div className="p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Track Name</label>
            <input type="text" className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" required value={formData.title} onChange={e => setFormData(p=>({...p, title: e.target.value}))}/>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Category</label>
              <select className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" value={formData.categoryId} onChange={e => setFormData(p=>({...p, categoryId: e.target.value}))}>
                {categories.map((c: any, index: number) => <option key={c.id || `cp2-${index}`} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="w-24">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Points</label>
              <input type="number" className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" min="1" value={formData.points} onChange={e => setFormData(p=>({...p, points: parseInt(e.target.value)||0}))}/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block">Description</label>
            <textarea rows={3} className="w-full bg-base-200 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100" value={formData.description} onChange={e => setFormData(p=>({...p, description: e.target.value}))}/>
          </div>
        </div>
        <div className="p-6 border-t border-base-200 bg-base-200 flex justify-end gap-3 rounded-b-[2rem]">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-text-light transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="bg-primary-600 px-8 py-3 rounded-xl text-base-50 font-black shadow-lg shadow-primary-100 active:scale-95 transition-all">Save Template</button>
        </div>
      </div>
    </div>
  );
}


