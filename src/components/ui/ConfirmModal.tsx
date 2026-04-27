import React from 'react';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-base-900/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="bg-base-100 rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
        <h3 className="text-xl font-black text-text-main mb-2">{title}</h3>
        <p className="text-sm text-text-muted mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl bg-base-200 text-text-muted font-bold hover:bg-base-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-base-50 font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">Delete</button>
        </div>
      </div>
    </div>
  );
}
