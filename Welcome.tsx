
import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, Cpu, Fingerprint, Mail, User as UserIcon, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Vehicle } from '../types';

interface WelcomeProps {
  onAuthComplete: (userData: { name: string, email: string, initialVehicle?: Vehicle }) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<'splash' | 'signup' | 'login'>('splash');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [carYear, setCarYear] = useState('2022');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carMiles, setCarMiles] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 1) {
      if (!name || !email) return;
      setSignupStep(2);
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const user = databaseService.register(name, email);
        const initialVehicle: Vehicle = {
          id: Date.now().toString(),
          year: parseInt(carYear) || 2022,
          make: carMake || 'Unknown',
          model: carModel || 'Vehicle',
          mileage: parseInt(carMiles) || 0,
          fuelType: 'gas'
        };
        localStorage.setItem('bs_user_account', JSON.stringify(user));
        onAuthComplete({ ...user, initialVehicle });
      } catch (err) {
        setError("Sync error. Check connection.");
        setLoading(false);
      }
    }, 1500);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const user = databaseService.findUser(email);
      if (user) {
        databaseService.updateLogin(user.email);
        localStorage.setItem('bs_user_account', JSON.stringify(user));
        onAuthComplete(user);
      } else {
        setError("Profile not found. Please register.");
        setLoading(false);
      }
    }, 1800);
  };

  return (
    <div className="h-screen bg-slate-950 text-white p-8 flex flex-col overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-soft" />
      <div className="absolute bottom-[-10%] left-[-20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 pt-8 flex flex-col items-center text-center flex-1">
        {mode !== 'splash' && (
          <button onClick={() => { 
              if (mode === 'signup' && signupStep === 2) setSignupStep(1);
              else setMode('splash');
              setError(null); 
            }}
            className="absolute top-0 left-0 p-3 text-slate-400 hover:text-white transition-all active:scale-75"
          >
            <ArrowLeft size={24} />
          </button>
        )}

        <div className="mb-12 animate-page">
          <h1 className="script-logo text-7xl gold-text drop-shadow-[0_4px_12px_rgba(217,119,6,0.3)] mb-0">
            BuildScript
          </h1>
          <p className="text-amber-500/80 font-black tracking-[0.2em] uppercase text-[10px] mt-2">
            Automotive Intelligence Engine
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase p-4 rounded-2xl tracking-wider w-full animate-scale flex items-center gap-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {mode === 'splash' && (
          <div className="w-full flex-1 flex flex-col justify-center gap-6 animate-page">
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
              Precision diagnostics and predictive maintenance logic for your high-performance fleet.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-4 glass p-6 rounded-[2.5rem] stagger-1 animate-page">
                <div className="text-indigo-400 p-3 bg-indigo-500/10 rounded-2xl"><Cpu size={22} /></div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-left">Advanced System Analysis</div>
              </div>
              <div className="flex items-center gap-4 glass p-6 rounded-[2.5rem] stagger-2 animate-page">
                <div className="text-emerald-400 p-3 bg-emerald-500/10 rounded-2xl"><ShieldCheck size={22} /></div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-left">Safety-Critical Guardrails</div>
              </div>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="w-full text-left space-y-8 animate-page">
            {signupStep === 1 ? (
              <div className="space-y-6">
                <div><h2 className="text-3xl font-black mb-2">Driver Profile</h2><p className="text-slate-400 text-sm">Create your system credentials.</p></div>
                <div className="space-y-4">
                  <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="text" placeholder="Driver Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder:text-slate-600 font-bold" />
                  </div>
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder:text-slate-600 font-bold" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-page">
                <div><h2 className="text-3xl font-black mb-2">Fleet Link</h2><p className="text-slate-400 text-sm">Register your primary diagnostic asset.</p></div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Year" required value={carYear} onChange={(e) => setCarYear(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white outline-none font-bold" />
                    <input type="text" placeholder="Make" required value={carMake} onChange={(e) => setCarMake(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white outline-none font-bold" />
                  </div>
                  <input type="text" placeholder="Model (e.g. 911 GT3)" required value={carModel} onChange={(e) => setCarModel(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white outline-none font-bold" />
                  <input type="number" placeholder="Odometer Miles" required value={carMiles} onChange={(e) => setCarMiles(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white outline-none font-bold" />
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-indigo-900/40">
              {loading ? <Loader2 size={20} className="animate-spin" /> : (signupStep === 1 ? 'Next Step' : 'Initialize BuildScript')}
            </button>
          </form>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="w-full text-center space-y-12 animate-page">
            <div><h2 className="text-3xl font-black mb-2">Welcome back</h2><p className="text-slate-400 text-sm">Authenticate your session.</p></div>
            <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder:text-slate-600 font-bold" />
            </div>
            <div className="flex flex-col items-center gap-6">
              <button type="button" onClick={() => !loading && handleLogin()} className="relative group p-1 active:scale-90 transition-all">
                <div className={`w-28 h-28 rounded-full border-2 border-indigo-500/20 flex items-center justify-center bg-indigo-500/5 transition-all group-hover:scale-105`}>
                  <Fingerprint size={56} className={`text-indigo-400 ${loading ? 'animate-pulse' : ''}`} />
                </div>
                {loading && <div className="absolute inset-0 border-2 border-indigo-400 rounded-full animate-ping opacity-20" />}
              </button>
              <div className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                {loading ? 'Decrypting...' : 'Tap for Biometric'}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-white text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50">
              Launch Session
            </button>
          </form>
        )}
      </div>

      <div className="relative z-10 pb-12 flex flex-col gap-4 animate-page">
        {mode === 'splash' && (
          <>
            <button onClick={() => setMode('signup')} className="w-full bg-white text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.1)]">
              Register New Profile <ChevronRight size={18} />
            </button>
            <button onClick={() => setMode('login')} className="w-full glass text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 transition-all active:scale-95">
              Sign In <Fingerprint size={18} />
            </button>
          </>
        )}
        <p className="text-center text-[8px] text-slate-700 font-black uppercase tracking-[0.4em] mono mt-4 opacity-40">
          STABLE RELEASE // BUILD 2025.04
        </p>
      </div>
    </div>
  );
};

export default Welcome;
