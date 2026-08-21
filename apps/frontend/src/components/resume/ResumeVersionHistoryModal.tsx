'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { History, CheckCircle2, Trash2, ShieldCheck, X, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/stores/resume-store';

interface ResumeVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeVersionHistoryModal: React.FC<ResumeVersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const { activeResume, setActiveVersion, deleteResumeVersion, setPreviewModalOpen } = useResumeStore();

  if (!isOpen || !activeResume) return null;

  const versions = activeResume.versions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="glass-1 border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Resume Version History</h3>
              <p className="text-xs text-[#66788A]">Manage and restore uploaded resume versions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:glass-1 text-[#66788A] hover:text-[#F5FAFF]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                ver.isActive
                  ? 'bg-primary/5 border-primary shadow-xs'
                  : 'glass-1 hover:glass-1/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl glass-1 shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate">{ver.originalName}</h4>
                    {ver.isActive && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#66788A] mt-0.5">
                    ATS Score: <span className="font-bold text-[#F5FAFF]">{ver.atsScore}/100</span> • Uploaded{' '}
                    {new Date(ver.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!ver.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveVersion(ver.id)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Restore Active
                  </Button>
                )}

                <button
                  onClick={() => deleteResumeVersion(ver.id)}
                  disabled={ver.isActive && versions.length === 1}
                  className="p-2 text-[#66788A] hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30"
                  title="Delete version"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
