'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Printer, ZoomIn, ZoomOut, RotateCcw, Code, FileText, X, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/stores/resume-store';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ isOpen, onClose }) => {
  const { activeResume } = useResumeStore();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewTab, setViewTab] = useState<'document' | 'json'>('document');

  if (!isOpen || !activeResume) return null;

  const data = activeResume.parsedData;
  const personal = data.personalInfo || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${personal.name || 'resume'}_parsed.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="glass-1 border rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b glass-1/30">
          <div className="flex items-center gap-2">
            <Button
              variant={viewTab === 'document' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewTab('document')}
              className="rounded-xl text-xs font-bold"
            >
              <FileText className="w-4 h-4 mr-1.5" /> Formatted Document
            </Button>
            <Button
              variant={viewTab === 'json' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewTab('json')}
              className="rounded-xl text-xs font-bold"
            >
              <Code className="w-4 h-4 mr-1.5" /> Parsed Raw JSON
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {viewTab === 'document' && (
              <div className="flex items-center gap-1 glass-1 rounded-xl p-1 border">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                  className="p-1 text-[#66788A] hover:text-[#F5FAFF] rounded-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold w-12 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="p-1 text-[#66788A] hover:text-[#F5FAFF] rounded-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-[#66788A] hover:text-[#F5FAFF] rounded-lg"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Button size="sm" variant="outline" onClick={handlePrint} className="rounded-xl text-xs font-bold">
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </Button>

            <Button size="sm" onClick={handleDownload} className="rounded-xl text-xs font-bold">
              <Download className="w-4 h-4 mr-1.5" /> Export Data
            </Button>

            <button onClick={onClose} className="p-2 rounded-full hover:glass-1 text-[#66788A] hover:text-[#F5FAFF]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-6 glass-1/20">
          {viewTab === 'json' ? (
            <pre className="p-4 bg-zinc-950 text-emerald-400 text-xs font-mono rounded-2xl overflow-auto border max-h-full">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <div
              className="mx-auto bg-white dark:bg-zinc-900 border rounded-2xl shadow-lg p-8 space-y-6 text-[#F5FAFF] transition-all origin-top"
              style={{ transform: `scale(${zoomLevel / 100})`, maxWidth: '800px' }}
            >
              {/* Header */}
              <div className="border-b pb-4 space-y-2">
                <h1 className="text-3xl font-black text-[#F5FAFF] tracking-tight">{personal.name || 'Developer Name'}</h1>
                <p className="text-sm font-bold text-primary">{personal.headline}</p>

                <div className="flex flex-wrap gap-4 text-xs text-[#66788A] pt-1">
                  {personal.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> {personal.email}</span>}
                  {personal.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-primary" /> {personal.phone}</span>}
                  {personal.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {personal.location}</span>}
                  {personal.github && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-primary" /> {personal.github}</span>}
                </div>
              </div>

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#66788A] border-b pb-1">
                    Education
                  </h3>
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-sm block">{edu.degree}</span>
                        <span className="text-[#66788A] font-semibold">{edu.college}</span>
                      </div>
                      <div className="text-right text-[#66788A] font-semibold">
                        <span>Graduation: {edu.graduationYear}</span>
                        <span className="block text-primary font-bold">{edu.cgpa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Skills */}
              {data.skills && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#66788A] border-b pb-1">
                    Technical Skills & Tools
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(data.skills).map(([cat, list], idx) => {
                      if (!list || list.length === 0) return null;
                      return (
                        <div key={idx} className="flex gap-2">
                          <span className="font-bold text-[#66788A] min-w-[130px] capitalize">
                            {cat.replace(/([A-Z])/g, ' $1')}:
                          </span>
                          <span className="font-semibold">{list.join(', ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#66788A] border-b pb-1">
                    Work Experience
                  </h3>
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center font-bold text-sm">
                        <span>{exp.role} — <span className="text-primary">{exp.company}</span></span>
                        <span className="text-xs text-[#66788A] font-normal">{exp.duration}</span>
                      </div>
                      <p className="text-[#66788A] leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Featured Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#66788A] border-b pb-1">
                    Featured Projects
                  </h3>
                  {data.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-sm">{proj.title}</span>
                        <span className="text-primary text-[11px] font-semibold">{proj.technologies?.join(' • ')}</span>
                      </div>
                      <p className="text-[#66788A] leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications & Achievements */}
              {data.certifications && data.certifications.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#66788A] border-b pb-1">
                    Certifications
                  </h3>
                  <ul className="list-disc list-inside text-xs text-[#66788A] font-medium">
                    {data.certifications.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
