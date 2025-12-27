
import React, { useState, useMemo } from 'react';
import { Vehicle, SubscriptionTier } from '../types';
import { databaseService, UserProfile } from '../services/databaseService';
import { paymentService } from '../services/paymentService';
import { 
  Settings, 
  Car, 
  LogOut, 
  ChevronRight, 
  Database, 
  Save, 
  X, 
  Crown, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  Lock,
  User as UserIcon,
  Zap,
  Sparkles,
  Smartphone,
  Share2,
  FileText,
  Download,
  Edit3,
  Plus,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Wifi,
  Info
} from 'lucide-react';

interface ProfileProps {
  vehicles: Vehicle[];
  activeVehicleId: string;
  subscriptionTier: SubscriptionTier;
  onUpdateVehicle: (v: Vehicle) => void;
  onAddVehicle: (v: Vehicle) => void;
  onSwitchVehicle: (id: string) => void;
  onUpdateSubscription: (tier: SubscriptionTier) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  vehicles, 
  activeVehicleId, 
  subscriptionTier, 
  onUpdateVehicle, 
  onAddVehicle, 
  onSwitchVehicle,
  onUpdateSubscription
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUserRegistry, setShowUserRegistry] = useState(false);
  
  // Payment Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  const currentUserData = useMemo(() => {
    const saved = localStorage.getItem('bs_user_account');
    return saved ? JSON.parse(saved) as UserProfile : null;
  }, []);

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
  const [formVehicle, setFormVehicle] = useState<Vehicle>(activeVehicle);

  const getLimit = () => {
    if (subscriptionTier === 'free') return 1;
    if (subscriptionTier === 'pro') return 3;
    return Infinity;
  };

  const vehicleLimitReached = vehicles.length >= getLimit();

  const handleSave = () => {
    if (isAdding) {
      onAddVehicle({ ...formVehicle, id: Date.now().toString() });
      setIsAdding(false);
    } else {
      onUpdateVehicle(formVehicle);
      setIsEditing(false);
    }
  };

  const tiers = [
    { id: 'free', name: 'Free', price: '$0', desc: 'Add 1 vehicle', features: ['Standard Diagnostics'] },
    { id: 'pro', name: 'Pro', price: '$4.99/mo', desc: 'Add 3 vehicles', features: ['Priority AI Chat', 'Telemetry History'] },
    { id: 'premium', name: 'Premium', price: '$15.99/mo', desc: 'Unlimited vehicles', features: ['Modifications Terminal', 'Repair Guides'] },
  ];

  return (
    <div className="p-6 pb-24 space-y-8 max-w-md mx-auto">
      {/* 1. SECTION: HEADER & IDENTITY */}
      <section className="animate-in fade-in slide-in-from-top-4 duration-500">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
          <button className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
            <Settings size={20} />
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <UserIcon size={120} />
          </div>
          
          <div className="relative">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
              <img src={`https://picsum.photos/seed/${currentUserData?.email || 'alex'}/200`} alt="User" className="w-full h-full object-cover" />
            </div>
            {subscriptionTier === 'premium' && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                <Crown size={12} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-900 leading-tight">{currentUserData?.name || 'Guest Driver'}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">BuildScript ID: #{currentUserData?.email.split('@')[0].toUpperCase() || '8291'}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                subscriptionTier === 'premium' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {subscriptionTier}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: FLEET CONTROL */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
            <Car size={16} className="text-indigo-600" />
            Fleet Control
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {vehicles.length}/{getLimit() === Infinity ? '∞' : getLimit()} Linked
          </span>
        </div>

        <div className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 space-y-3">
          {isEditing || isAdding ? (
            <div className="space-y-4 p-5 bg-slate-50 rounded-[2rem] border-2 border-indigo-100 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  {isAdding ? 'Link New Vehicle' : `Edit ${formVehicle.year} ${formVehicle.make}`}
                </h4>
                <button onClick={() => { setIsEditing(false); setIsAdding(false); }} className="p-1 text-slate-400">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Year</label>
                  <input type="number" value={formVehicle.year} onChange={(e) => setFormVehicle({...formVehicle, year: parseInt(e.target.value) || 0})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-950 outline-none focus:border-indigo-500" placeholder="Year" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Make</label>
                  <input type="text" value={formVehicle.make} onChange={(e) => setFormVehicle({...formVehicle, make: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-950 outline-none focus:border-indigo-500" placeholder="Make" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Model</label>
                <input type="text" value={formVehicle.model} onChange={(e) => setFormVehicle({...formVehicle, model: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-950 outline-none focus:border-indigo-500" placeholder="Model" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                  <Save size={14} /> Commit Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => onSwitchVehicle(v.id)}
                  className={`p-4 rounded-2xl flex justify-between items-center border transition-all cursor-pointer relative group ${
                    v.id === activeVehicleId ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${v.id === activeVehicleId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      <Zap size={20} className={v.id === activeVehicleId ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-black text-slate-900">{v.year} {v.make}</div>
                        {v.id === activeVehicleId && (
                          <span className="text-[7px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase tracking-widest animate-in fade-in">Live</span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{v.model}</div>
                    </div>
                  </div>
                  {v.id === activeVehicleId && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); setFormVehicle(v); }}
                      className="p-2.5 bg-white rounded-xl text-indigo-600 border border-indigo-100 shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <section className="space-y-4">
        {currentUserData?.role === 'creator' && (
          <button onClick={() => setShowUserRegistry(true)} className="w-full flex items-center justify-between p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400"><Database size={20} /></div>
              <div className="text-left"><span className="font-bold text-sm block">System Database</span><span className="text-[10px] font-bold uppercase opacity-60">Admin Access</span></div>
            </div>
            <ChevronRight size={18} className="opacity-50" />
          </button>
        )}
        <button onClick={() => { localStorage.removeItem('bs_authenticated'); window.location.reload(); }} className="w-full py-5 bg-red-50 text-red-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-red-100 active:scale-95 transition-all">
          <LogOut size={16} /> Terminate Session
        </button>
      </section>

      {/* USER REGISTRY MODAL */}
      {showUserRegistry && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-300 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 text-slate-900">
              <h3 className="text-xl font-black">User Registry</h3>
              <button onClick={() => setShowUserRegistry(false)} className="p-2 bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {databaseService.getRegistry().map((u, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-slate-900">
                  <div>
                    <div className="text-sm font-bold">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{u.subscription}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSubscription && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-indigo-900 w-full max-w-md rounded-[2.5rem] p-8 text-white animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div><h3 className="text-2xl font-black tracking-tight">Upgrade Terminal</h3><p className="text-indigo-300 text-xs">Unlock professional intelligence</p></div>
              <button onClick={() => setShowSubscription(false)} className="text-indigo-400 p-2"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <button key={tier.id} onClick={() => onUpdateSubscription(tier.id as SubscriptionTier)} className={`w-full p-5 rounded-3xl border transition-all text-left flex justify-between items-center ${subscriptionTier === tier.id ? 'bg-white text-indigo-900 border-white' : 'bg-white/5 border-white/10'}`}>
                  <div><span className="font-black uppercase tracking-widest text-xs">{tier.name}</span><div className="text-[10px] opacity-60 mt-1">{tier.desc}</div></div>
                  <div className="font-black text-sm">{tier.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
