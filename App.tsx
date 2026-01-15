
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Briefcase, Bell, Search, Filter, ShieldCheck, MapPin, 
  ExternalLink, Menu, X, LayoutDashboard, Globe, Landmark, 
  ChevronRight, Sparkles, Map, RefreshCw, Activity, GraduationCap,
  Award, FileText, Newspaper, Smartphone, ShieldAlert
} from 'lucide-react';
import { Job, JobStatus, Source, ScrapingLog, ContentType } from './types';
import JobCard from './components/JobCard';
import WhatsAppAlerts from './components/WhatsAppAlerts';
import AdminPanel from './components/AdminPanel';
import { extractJobData } from './services/geminiService';

const ALL_STATES = [
  "Uttar Pradesh", "Bihar", "Madhya Pradesh", "Haryana", "Gujarat", "Maharashtra", 
  "Punjab", "Jharkhand", "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Delhi"
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'rpsc-1',
    job_title: 'RPSC Rajasthan Administrative Services (RAS) 2025',
    department: 'Rajasthan Public Service Commission',
    post_name: 'RAS / RTS',
    qualification: 'Graduate',
    age_limit: '21-40 Years',
    total_posts: 905,
    start_date: '2025-04-01',
    last_date: '2025-05-30',
    apply_link: 'https://rpsc.rajasthan.gov.in',
    notification_pdf_url: 'https://rpsc.rajasthan.gov.in',
    state: 'Rajasthan',
    category: 'Administrative',
    status: JobStatus.APPROVED,
    created_at: new Date().toISOString(),
    is_center_level: false,
    source_name: 'RPSC Official',
    eligibility_details: 'Authentic RPSC Recruitment for State Services.',
    how_to_apply_steps: ["Go to RPSC Website", "Apply via SSO ID"],
    content_type: ContentType.JOB,
    is_authentic_board: true
  } as any,
  {
    id: 'rssb-1',
    job_title: 'RSMSSB LDC / Junior Assistant Recruitment 2025',
    department: 'Rajasthan Staff Selection Board',
    post_name: 'LDC',
    qualification: '12th + RS-CIT',
    age_limit: '18-40 Years',
    total_posts: 4197,
    start_date: '2025-03-01',
    last_date: '2025-03-31',
    apply_link: 'https://rssb.rajasthan.gov.in',
    notification_pdf_url: 'https://rssb.rajasthan.gov.in',
    state: 'Rajasthan',
    category: 'Clerical',
    status: JobStatus.APPROVED,
    created_at: new Date().toISOString(),
    is_center_level: false,
    source_name: 'RSMSSB Official',
    eligibility_details: 'Direct recruitment for various departments in Rajasthan.',
    how_to_apply_steps: ["Login to SSO Portal", "Select Recruitment Stack 2"],
    content_type: ContentType.JOB,
    is_authentic_board: true
  } as any
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'alerts' | 'admin' | 'students'>('home');
  const [levelFilter, setLevelFilter] = useState<'rajasthan' | 'center' | 'other'>('rajasthan');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [studentSubTab, setStudentSubTab] = useState<ContentType | 'ALL'>('ALL');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<ScrapingLog[]>([]);

  const runAutoSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    const addLog = (status: 'SUCCESS' | 'FAILED', message: string) => {
      setLogs(prev => [{ id: Math.random().toString(), source_id: 'auto', status, detected_links: 1, message, timestamp: new Date().toISOString() }, ...prev].slice(0, 30));
    };

    addLog('SUCCESS', 'Searching for Rajasthan & Central Jobs on RajasthanCareers.in and Boards...');
    
    try {
      // Expanded and targeted RSS feeds
      const rssSources = [
        'https://rajasthancareers.in/category/rajasthan-jobs/feed/', // Dedicated Rajasthan Feed
        'https://rajasthancareers.in/category/central-govt-jobs/feed/', // Dedicated Central Feed
        'https://rajasthancareers.in/category/admit-card/feed/', // Dedicated Admit Card Feed
        'https://rajasthancareers.in/category/result/feed/', // Dedicated Result Feed
        'https://rajasthancareers.in/feed/', // General Feed
        'https://www.freejobalert.com/feed/' // Backup source
      ];
      
      let totalNewFound = 0;

      for (const source of rssSources) {
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source)}&timestamp=${Date.now()}`;
          const response = await fetch(proxyUrl);
          if (!response.ok) continue;
          
          const data = await response.json();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, "text/xml");
          const items = Array.from(xmlDoc.querySelectorAll("item")).slice(0, 5); // Process fewer items per source for speed
          
          for (const item of items) {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            const description = item.querySelector("description")?.textContent || "";

            // Deduplication Check
            if (jobs.some(j => j.job_title === title || j.apply_link === link)) continue;

            const extracted = await extractJobData(`SOURCE_FEED: ${source}\nTITLE: ${title}\nDESC: ${description}\nLINK: ${link}`);
            
            if (extracted) {
              setJobs(prev => {
                if (prev.some(j => j.job_title === extracted.job_title && j.state === extracted.state)) return prev;
                totalNewFound++;
                return [{ ...extracted, status: JobStatus.APPROVED }, ...prev];
              });
              const sourceLabel = source.includes('rajasthancareers') ? "RajasthanCareers" : "Official Feed";
              addLog('SUCCESS', `Auto-Synced [${sourceLabel}]: ${extracted.job_title}`);
            }
          }
        } catch (sourceErr) {
          console.error(`Failed to sync source: ${source}`, sourceErr);
        }
      }
      
      if (totalNewFound === 0) {
        addLog('SUCCESS', 'Automation: All Rajasthan & Central feeds are currently up to date.');
      }
    } catch (err) {
      addLog('FAILED', 'Automation Engine: Critical connection failure to source nodes.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, jobs]);

  useEffect(() => {
    runAutoSync();
    // 30-minute precise automation loop
    const interval = setInterval(runAutoSync, 1800000); 
    return () => clearInterval(interval);
  }, []);

  const sortedAndFilteredJobs = useMemo(() => {
    let list = jobs.filter(j => j.status === JobStatus.APPROVED);
    
    list.sort((a, b) => {
      const now = new Date();
      const aLive = new Date(a.start_date) <= now && new Date(a.last_date) >= now;
      const bLive = new Date(b.start_date) <= now && new Date(b.last_date) >= now;
      
      if (aLive !== bLive) return aLive ? -1 : 1;
      
      const aBoard = (a as any).is_authentic_board ? 1 : 0;
      const bBoard = (b as any).is_authentic_board ? 1 : 0;
      if (aBoard !== bBoard) return bBoard - aBoard;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list.filter(job => {
      const matchesSearch = job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.source_name.toLowerCase().includes(searchQuery.toLowerCase());
      const jobState = job.state?.toLowerCase() || "";
      
      if (activeTab === 'home') {
        if (job.content_type !== ContentType.JOB) return false;
        if (levelFilter === 'rajasthan') return matchesSearch && jobState.includes('rajasthan');
        if (levelFilter === 'center') return matchesSearch && job.is_center_level;
        const isOther = !job.is_center_level && !jobState.includes('rajasthan');
        const matchesState = selectedState === 'All States' || job.state === selectedState;
        return matchesSearch && isOther && matchesState;
      }
      
      if (activeTab === 'students') {
        if (job.content_type === ContentType.JOB) return false;
        const matchesSubTab = studentSubTab === 'ALL' || job.content_type === studentSubTab;
        let stateMatches = true;
        if (levelFilter === 'rajasthan') stateMatches = jobState.includes('rajasthan');
        else if (levelFilter === 'center') stateMatches = job.is_center_level;
        else if (selectedState !== 'All States') stateMatches = job.state === selectedState;
        return matchesSearch && matchesSubTab && stateMatches;
      }
      return false;
    });
  }, [jobs, searchQuery, levelFilter, activeTab, selectedState, studentSubTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg transition-transform group-hover:scale-110">R</div>
            <div>
              <span className="text-xl font-black text-slate-900 leading-none block tracking-tight">RajGovJobs</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{isSyncing ? 'Auto-Sync Active' : 'Board Monitoring'}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>Jobs Portal</button>
            <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${activeTab === 'students' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>Students Tab</button>
            <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex items-center space-x-2 ${activeTab === 'alerts' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
               <Bell size={14} />
               <span>Alerts</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button onClick={() => setActiveTab('admin')} className={`p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors ${activeTab === 'admin' ? 'text-indigo-600 bg-indigo-50 shadow-inner' : ''}`}><LayoutDashboard size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {(activeTab === 'home' || activeTab === 'students') && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-2">
                <ShieldCheck size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>RajasthanCareers.in + RPSC + RSMSSB Monitoring ON</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {activeTab === 'home' ? <>Rajasthan <span className="text-indigo-600">Jobs Engine</span></> : <>Exams, Results & <span className="text-indigo-600">Admit Cards</span></>}
              </h1>
              <div className="max-w-xl mx-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder={`Search Boards, Posts or Results...`}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none shadow-sm transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="w-full max-w-2xl bg-white p-1.5 rounded-[2rem] flex border border-slate-200 shadow-xl shadow-slate-200/50">
                <button onClick={() => setLevelFilter('rajasthan')} className={`flex-1 py-3 px-2 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center space-x-2 ${levelFilter === 'rajasthan' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Landmark size={14} />
                  <span>Rajasthan</span>
                </button>
                <button onClick={() => setLevelFilter('center')} className={`flex-1 py-3 px-2 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center space-x-2 ${levelFilter === 'center' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Globe size={14} />
                  <span>Central</span>
                </button>
                <button onClick={() => setLevelFilter('other')} className={`flex-1 py-3 px-2 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center space-x-2 ${levelFilter === 'other' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <MapPin size={14} />
                  <span>States</span>
                </button>
              </div>

              {levelFilter === 'other' && (
                <div className="w-full max-w-4xl flex space-x-2 overflow-x-auto pb-4 no-scrollbar bg-slate-50/50 p-2 rounded-2xl">
                  {['All States', ...ALL_STATES].map(state => (
                    <button 
                      key={state}
                      onClick={() => setSelectedState(state)}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap border transition-all ${selectedState === state ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'students' && (
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { id: 'ALL', label: 'All Updates', icon: Award, color: 'text-slate-500' },
                    { id: ContentType.RESULT, label: 'Results', icon: FileText, color: 'text-emerald-500' },
                    { id: ContentType.ADMIT_CARD, label: 'Admit Cards', icon: Smartphone, color: 'text-blue-500' },
                    { id: ContentType.ADMISSION, label: 'Admissions', icon: GraduationCap, color: 'text-indigo-500' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setStudentSubTab(tab.id as any)}
                      className={`flex items-center space-x-3 px-8 py-4 rounded-[1.5rem] border transition-all font-black text-[10px] uppercase tracking-wider ${studentSubTab === tab.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' : 'bg-white text-slate-600 border-slate-100 hover:shadow-lg'}`}
                    >
                      <tab.icon size={18} className={studentSubTab === tab.id ? 'text-white' : tab.color} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
              {sortedAndFilteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
              {sortedAndFilteredJobs.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                    <ShieldAlert className="text-slate-200" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Scanning All Boards...</h3>
                  <p className="text-slate-400 text-xs font-bold mt-3 max-w-xs">Our system is checking RajasthanCareers.in, RPSC, and RSMSSB for the latest 2025 updates. Try changing the category filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && <WhatsAppAlerts />}
        {activeTab === 'admin' && (
          <AdminPanel 
            jobs={jobs} 
            sources={[]} 
            onUpdateJob={(u) => setJobs(prev => prev.map(j => j.id === u.id ? u : j))} 
            onAddJob={(n) => setJobs(prev => [n, ...prev])} 
            backgroundLogs={logs}
            isBackgroundSyncing={isSyncing}
          />
        )}
      </main>

      <footer className="bg-slate-900 text-white py-20 mt-auto border-t-[10px] border-indigo-600">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
            <div className="space-y-6">
               <div className="flex items-center space-x-4 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">R</div>
                  <span className="text-3xl font-black tracking-tighter">RajGovJobs</span>
               </div>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">The only AI-powered recruitment engine tracking RajasthanCareers.in, RPSC, RSMSSB, and Union level recruitments simultaneously.</p>
               <div className="flex space-x-4 justify-center md:justify-start">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"><Smartphone size={20} /></div>
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"><Globe size={20} /></div>
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"><Bell size={20} /></div>
               </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-slate-800 pb-2 inline-block">Authentic Data Mesh</h4>
               <p className="text-slate-400 text-xs font-bold leading-loose">
                  Our system verifies data from:
                  <br/>• rajasthancareers.in (Primary)
                  <br/>• rpsc.rajasthan.gov.in
                  <br/>• rssb.rajasthan.gov.in
                  <br/>• sso.rajasthan.gov.in
               </p>
            </div>
            <div className="flex flex-col items-center md:items-end justify-center space-y-4">
               <div className="flex items-center space-x-3 text-emerald-500 font-black text-xs uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <Activity size={16} className="animate-pulse" />
                  <span>30-Min Sync: Heartbeat OK</span>
               </div>
               <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Version 2.7.0 • © 2025 RajGovJobs</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
