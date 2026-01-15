
import React, { useState } from 'react';
import { 
  Calendar, Users, GraduationCap, ArrowRight, Building2, 
  MapPin, Share2, Copy, FileText, CheckCircle, Info, ChevronDown, ChevronUp,
  Landmark, Globe, Map, Activity, ShieldCheck, Clock
} from 'lucide-react';
import { Job, ContentType } from '../types';

interface JobCardProps {
  job: Job & { is_authentic_board?: boolean };
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [showApplyGuide, setShowApplyGuide] = useState(false);
  
  const now = new Date();
  const startDate = new Date(job.start_date);
  const lastDate = new Date(job.last_date);
  
  const isExpired = lastDate < now;
  const isUpcoming = startDate > now;
  const isLive = !isExpired && !isUpcoming;
  
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
    } catch {
      return dateStr;
    }
  };

  const isRajasthan = job.state?.toLowerCase().includes('rajasthan');
  const isCentral = job.is_center_level;
  
  const themeClass = isRajasthan ? 'border-b-emerald-600' : isCentral ? 'border-b-blue-600' : 'border-b-indigo-600';
  const badgeClass = isRajasthan ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : isCentral ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100';

  const getJobSummaryText = () => {
    return `🔥 *New Govt Alert*
📢 *${job.job_title}*

📍 State: ${job.state}
🏢 Org: ${job.source_name}
📝 Post: ${job.post_name}
🎓 Edu: ${job.qualification}
📅 Last Date: ${formatDate(job.last_date)}

🔗 *Apply:* ${job.apply_link}
✅ RajGovJobs Auto-Sync`;
  };

  return (
    <div className={`bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col h-full border-b-8 ${themeClass}`}>
      <div className="p-6 md:p-8 flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-wrap gap-2">
            <div className={`flex items-center space-x-1 text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${badgeClass}`}>
              {isCentral ? <Globe size={12} /> : isRajasthan ? <Landmark size={12} /> : <Map size={12} />}
              <span>{job.state || 'General'}</span>
            </div>
            {job.is_authentic_board && (
              <div className="flex items-center space-x-1 text-[10px] font-black px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-widest">
                <ShieldCheck size={12} />
                <span>Verified Board</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end">
             {isLive && job.content_type === ContentType.JOB && (
                <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded animate-pulse border border-emerald-100">
                   <Activity size={10} />
                   <span>LIVE</span>
                </div>
             )}
             {isUpcoming && job.content_type === ContentType.JOB && (
                <div className="flex items-center space-x-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                   <Clock size={10} />
                   <span>UPCOMING</span>
                </div>
             )}
             {isExpired && job.content_type === ContentType.JOB && (
                <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                   EXPIRED
                </div>
             )}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{job.source_name || job.department}</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-[1.2] tracking-tight">
            {job.job_title}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education</p>
            <div className="flex items-center space-x-2 text-sm text-slate-900 font-black">
              <GraduationCap size={16} className="text-indigo-500" />
              <span className="truncate">{job.qualification}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isUpcoming ? 'Starting From' : 'Closing Date'}</p>
            <div className={`flex items-center space-x-2 text-sm font-black ${isExpired ? "text-rose-500" : isUpcoming ? "text-blue-600" : "text-slate-900"}`}>
              <Calendar size={16} className={isExpired ? "text-rose-500" : isUpcoming ? "text-blue-400" : "text-slate-300"} />
              <span>{isUpcoming ? formatDate(job.start_date) : formatDate(job.last_date)}</span>
            </div>
          </div>
        </div>

        {job.eligibility_details && (
          <div className="mb-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Board Details</p>
            <p className="text-xs text-slate-700 font-bold leading-relaxed line-clamp-2">{job.eligibility_details}</p>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
           <span>Total Posts</span>
           <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{job.total_posts || 'Check Notice'}</span>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-slate-50/50 flex flex-col space-y-3">
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getJobSummaryText())}`, '_blank')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg font-black text-[10px] uppercase transition-all"><Share2 size={14} /><span>Share Alert</span></button>
        <div className="flex space-x-3">
          <a href={job.notification_pdf_url} target="_blank" className="flex-1 bg-white text-slate-700 py-3 border border-slate-200 rounded-xl text-[10px] font-black flex items-center justify-center space-x-2 uppercase hover:bg-slate-50 transition-colors"><FileText size={14} /><span>Notice</span></a>
          <button 
            onClick={() => window.open(job.apply_link, '_blank')} 
            disabled={isExpired} 
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase shadow-md transition-all ${isExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
          >
            {isUpcoming ? 'Notify Me' : isExpired ? 'Expired' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
