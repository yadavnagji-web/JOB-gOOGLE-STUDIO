
import React, { useState } from 'react';
import { Settings, Play, Check, X, RefreshCw, AlertCircle, Database, Rss, Download, Sparkles, Terminal, Eye, Map, Activity } from 'lucide-react';
import { Job, JobStatus, Source, ScrapingLog } from '../types';
import { extractJobData } from '../services/geminiService';

interface AdminPanelProps {
  jobs: Job[];
  sources: Source[];
  onUpdateJob: (job: Job) => void;
  onAddJob: (job: Job) => void;
  backgroundLogs?: ScrapingLog[];
  isBackgroundSyncing?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ jobs, sources, onUpdateJob, onAddJob, backgroundLogs = [], isBackgroundSyncing = false }) => {
  const [isScraping, setIsScraping] = useState(false);
  const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING);

  const simulateScrape = async () => {
    setIsScraping(true);
    const mockPdfText = `JHARKHAND SSC. Graduate Level CGL Exam 2025. 2025 Posts. Jharkhand State. Apply at jssc.nic.in.`;
    try {
      const extractedJob = await extractJobData(mockPdfText);
      if (extractedJob) {
        onAddJob({ ...extractedJob, status: JobStatus.APPROVED });
      }
    } finally {
      setIsScraping(false);
    }
  };

  const handleApprove = (job: Job) => onUpdateJob({ ...job, status: JobStatus.APPROVED });
  const handleReject = (job: Job) => onUpdateJob({ ...job, status: JobStatus.REJECTED });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-xl border border-slate-100 gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles size={24} className="text-indigo-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Automation Engine</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
             <div className={`w-2 h-2 rounded-full ${isBackgroundSyncing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
             <span>{isBackgroundSyncing ? 'BACKGROUND SYNC IS ACTIVE' : 'MONITORING SERVICES'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={simulateScrape} disabled={isScraping} className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl">
            {isScraping ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
            <span>Trigger Manual Scan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
            <Eye size={20} className="text-indigo-600" />
            Recently Auto-Added ({jobs.filter(j => j.status === JobStatus.APPROVED).slice(0, 5).length})
          </h3>
          
          <div className="space-y-4">
            {jobs.filter(j => j.status === JobStatus.APPROVED).slice(0, 5).map(job => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-6 border-l-[6px] border-l-indigo-600">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{job.department}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {job.state}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{job.job_title}</h4>
                    <p className="text-xs text-slate-400 font-bold">Auto-extracted via AI</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black border border-emerald-100">LIVE ON PORTAL</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-amber-400 mb-6">Automation Heartbeat</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {backgroundLogs.length === 0 ? (
                <p className="text-center py-10 opacity-20 font-black text-sm italic">System initializing...</p>
              ) : (
                backgroundLogs.map(log => (
                  <div key={log.id} className="border-l-2 border-slate-800 pl-4 py-1">
                    <div className="flex justify-between text-[9px] font-black mb-1 text-slate-500">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}>{log.status}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-300 leading-snug">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
