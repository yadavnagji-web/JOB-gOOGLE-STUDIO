
import React, { useState } from 'react';
import { Bell, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

const WhatsAppAlerts: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    qualification: 'Graduate',
    district: 'Jaipur',
    category: 'General'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  if (isSubscribed) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Successful!</h2>
        <p className="text-slate-600 mb-6">
          You will now receive instant alerts for <strong>Rajasthan Govt Jobs</strong> in {formData.district} matching your qualification ({formData.qualification}).
        </p>
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-500 flex items-start space-x-3 text-left">
          <ShieldCheck className="mt-1 text-slate-400 flex-shrink-0" size={16} />
          <p>We respect your privacy. No spam. Only official notifications and direct apply links will be sent to your WhatsApp number.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden flex flex-col md:flex-row max-w-4xl mx-auto">
      <div className="bg-indigo-600 p-8 md:w-2/5 text-white flex flex-col justify-center">
        <Bell className="mb-4 opacity-75" size={40} />
        <h2 className="text-2xl font-bold mb-4">Never miss a Rajasthan Job alert again!</h2>
        <p className="text-indigo-100 mb-8">Get instant updates from RPSC, RSSB, Rajasthan Police and more directly on your WhatsApp.</p>
        
        <ul className="space-y-4 text-sm">
          <li className="flex items-center space-x-3">
            <span className="bg-indigo-500 rounded-full p-1"><CheckCircle2 size={14} /></span>
            <span>Tailored to your qualification</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="bg-indigo-500 rounded-full p-1"><CheckCircle2 size={14} /></span>
            <span>Direct PDF & Apply Links</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="bg-indigo-500 rounded-full p-1"><CheckCircle2 size={14} /></span>
            <span>100% Free Service</span>
          </li>
        </ul>
      </div>

      <div className="p-8 md:w-3/5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Enter your name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp No.</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  required
                  type="tel" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="91xxxxxxxx"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Highest Ed.</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                value={formData.qualification}
                onChange={e => setFormData({...formData, qualification: e.target.value})}
              >
                <option>10th</option>
                <option>12th</option>
                <option>Graduate</option>
                <option>Post Graduate</option>
                <option>PhD/NET</option>
                <option>Technical (ITI/Diploma/BE)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">District</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                value={formData.district}
                onChange={e => setFormData({...formData, district: e.target.value})}
              >
                <option>Jaipur</option>
                <option>Jodhpur</option>
                <option>Udaipur</option>
                <option>Bikaner</option>
                <option>Kota</option>
                <option>Ajmer</option>
                <option>Alwar</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
                <option>EWS</option>
                <option>MBC</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-100"
          >
            <span>Activate WhatsApp Alerts</span>
          </button>
          
          <p className="text-[10px] text-center text-slate-400 px-8">
            By clicking activation, you agree to receive Rajasthan recruitment notifications on your registered WhatsApp number.
          </p>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppAlerts;
