'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
}

export function DeleteModal({ isOpen, onClose, onConfirm, title }: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-semibold text-white tracking-tight mb-2">Delete Task?</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                Are you sure you want to remove <span className="text-white font-semibold">"{title}"</span>? This action cannot be undone.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  Confirm Deletion
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-medium text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
