import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ActionMenu({ onEdit, onDelete, placement = 'bottom-end' }: { onEdit: () => void, onDelete: () => void, placement?: 'bottom-end' | 'top-center' }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const placementClass = placement === 'top-center' 
    ? 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-base-100 rounded-2xl border border-base-200 shadow-xl overflow-hidden z-50' 
    : 'absolute right-0 top-full mt-1 w-32 bg-base-100 rounded-2xl border border-base-200 shadow-xl overflow-hidden z-50';

  const animationProps = placement === 'top-center'
    ? { initial: { opacity: 0, y: 5, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 5, scale: 0.95 } }
    : { initial: { opacity: 0, y: -5, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -5, scale: 0.95 } };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
        className="p-1.5 hover:bg-base-200 rounded-lg text-text-light hover:text-text-main transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {isOpen && (
           <motion.div 
             {...animationProps}
             transition={{ duration: 0.1 }}
             className={placementClass}
           >
             <button 
               onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }} 
               className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-main hover:bg-base-50 transition-colors"
             >
               <Edit className="w-4 h-4 text-primary-500" /> Edit
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }} 
               className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-base-100"
             >
               <Trash2 className="w-4 h-4" /> Delete
             </button>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
