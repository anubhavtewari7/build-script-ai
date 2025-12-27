
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../types';
import { 
  Activity, 
  CheckCircle2, 
  Droplets, 
  Gauge, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Terminal,
  Cpu,
  Plus,
  X,
  Save,
  Clock,
  Navigation,
  Camera,
  Sparkles
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  vehicle: Vehicle;
  onUpdateVehicle: (v: Vehicle) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ vehicle, onUpdateVehicle }) => {
  const [activeLogType, setActiveLogType] = useState<'oil' | 'tire' | 'charge' | 'mileage' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [logValue, setLogValue] = useState<string>('');
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [chargeStart, setChargeStart] = useState<string>('10');
  const [chargeEnd, setChargeEnd] = useState<string>('80');
  const [chargeDuration, setChargeDuration] = useState<string>('45');
  const [newMileage, setNewMileage] = useState<string>(vehicle.mileage.toString());

  const isEV = vehicle.fuelType === 'electric' || vehicle.fuelType === 'hybrid';
  const hasNoLogs = !vehicle.logs || (Object.keys(vehicle.logs).length === 0);

  const { oilLifeRemaining, lastTireVal, lastCharge } = useMemo(() => {
    const lastOilMileage = vehicle.logs?.lastOilChangeMileage || 0;
    const lastOilDateStr = vehicle.logs?.lastOilChangeDate;
    
    let oilLife = 100;
    if (lastOilMileage > 0) {
      const mileageDelta = Math.max(0, vehicle.mileage - lastOilMileage);
      const mileagePercent = Math.max(0, 100 - Math.round((mileageDelta / 5000) * 100));
      
      let timePercent = 100;
      if (lastOilDateStr) {
        const lastDate = new Date(lastOilDateStr);
        const daysSince = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
        timePercent = Math.max(0, 100 - Math.round((daysSince / 180) * 100));
      }
      oilLife = Math.min(mileagePercent, timePercent);
    } else if (hasNoLogs) {
        oilLife = 100;
    }

    return {
      oilLifeRemaining: oilLife,
      lastTireVal: vehicle.logs?.lastTirePressureValue || 32,
      lastCharge: vehicle.logs?.evChargingHistory?.[vehicle.logs.evChargingHistory.length - 1]
    };
  }, [vehicle, hasNoLogs]);

  const handleSaveLog = () => {
    const updatedVehicle = { ...vehicle };
    if (!updatedVehicle.logs) updatedVehicle.logs = {};

    if (activeLogType === 'oil') {
      updatedVehicle.logs.lastOilChangeMileage = vehicle.mileage;
      updatedVehicle.logs.lastOilChangeDate = logDate;
    } else if (activeLogType === 'tire') {
      updatedVehicle.logs.lastTirePressureValue = parseInt(logValue) || 32;
      updatedVehicle.logs.lastTirePressureCheckDate = logDate;
    } else if (activeLogType === 'charge') {
      if (!updatedVehicle.logs.evChargingHistory) updatedVehicle.logs.evChargingHistory = [];
      updatedVehicle.logs.evChargingHistory.push({
        date: logDate,
        durationMinutes: parseInt(chargeDuration) || 0,
        startPercentage: parseInt(chargeStart) || 0,
        endPercentage: parseInt(chargeEnd) || 0
      });
    } else if (activeLogType === 'mileage') {
      updatedVehicle.mileage = parseInt(newMileage) || vehicle.mileage;
    }

    onUpdateVehicle(updatedVehicle);
    setActiveLogType(null);
    setLogValue('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const healthScore = Math.min(100, Math.max(0, isEV ? 95 : Math.min(100, oilLifeRemaining + 15)));
  const chartData = [{ name: 'Health', value: healthScore }];

  const stats = [
    { type: 'oil', label: 'Oil Life', value: isEV ? 'N/A' : (hasNoLogs && oilLifeRemaining === 100 ? 'Add Log' : `${oilLifeRemaining}%`), icon: <Droplets className="text-blue-500" />, status: !isEV && oilLifeRemaining < 20 ? 'Service' : (hasNoLogs ? 'Setup' : 'Good'), hidden: isEV },
    { type: 'charge', label: lastCharge ? 'Last Charge' : (isEV ? 'Battery' : 'Battery V'), value: lastCharge ? `${lastCharge.endPercentage}%` : (isEV ? '80%' : '12.8V'), icon: isEV || lastCharge ? <Zap className="text-emerald-500" /> : <Zap className="text-yellow-500" />, status: 'Good' },
    { type: 'tire', label: 'Tire PSI', value: `${lastTireVal} avg`, icon: <Gauge className="text-emerald-500" />, status: lastTireVal < 28 || lastTireVal > 40 ? 'Check' : 'Good' },
    { type: 'system', label: 'System', value: 'Active', icon: <ShieldCheck className="text-indigo-500" />, status: 'Safe' },
  ];

  return (
    <div className="p-6 pb-24 animate-page">
      <header className="mb-8 flex justify-between items-end opacity-0 animate-page stagger-1">
        <div>
          <h2 className="text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-1 uppercase mono">BuildScript // v2.4</h2>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {vehicle.year} {vehicle.make} <br/> 
            <span className="text-slate-400 font-bold">{vehicle.model}</span>
          </h1>
        </div>
        <button 
          onClick={() => { setNewMileage(vehicle.mileage.toString()); setActiveLogType('mileage'); }}
          className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95"
        >
          <Navigation size={18} className="text-indigo-600 mb-1" />
          <span className="text-[10px] font-black text-slate-900">{vehicle.mileage.toLocaleString()}</span>
        </button>
      </header>

      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-scale">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">Telemetry Synced</span>
        </div>
      )}

      {hasNoLogs && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 p-5 rounded-[2rem] opacity-0 animate-page stagger-1">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <Sparkles size={18} className="animate-pulse-soft" />
             </div>
             <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Calibration Phase</h4>
                <p className="text-[10px] text-slate-500 font-medium">Complete these to activate AI analytics</p>
             </div>
          </div>
          <div className="space-y-2">
             <button onClick={() => setActiveLogType('oil')} className="w-full flex justify-between items-center p-4 bg-white rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all active:scale-[0.98]">
                <span>1. Log Last Oil Service</span>
                <Plus size={14} />
             </button>
             <button onClick={() => setActiveLogType('tire')} className="w-full flex justify-between items-center p-4 bg-white rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all active:scale-[0.98]">
                <span>2. Calibrate Tire Pressure</span>
                <Plus size={14} />
             </button>
          </div>
        </div>
      )}

      <div className="bg-indigo-900 rounded-[2.5rem] p-6 shadow-2xl mb-8 text-white relative overflow-hidden opacity-0 animate-page stagger-2">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu size={120} />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="w-1/2">
            <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Build Integrity</h3>
            <div className="text-5xl font-black mb-4 tracking-tighter">{healthScore}%</div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full w-fit">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-wide">Systems Nominal</span>
            </div>
          </div>
          
          <div className="w-28 h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={chartData} startAngle={90} endAngle={450}>
                <RadialBar background dataKey="value" cornerRadius={10}>
                  <Cell fill="#818cf8" />
                </RadialBar>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity size={24} className="text-indigo-300 animate-pulse-soft" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.filter(s => !s.hidden).map((stat, i) => (
          <button 
            key={i} 
            onClick={() => stat.type !== 'system' && setActiveLogType(stat.type as any)}
            className={`bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-left transition-all hover:border-indigo-300 active:scale-95 relative group h-32 flex flex-col justify-between opacity-0 animate-page stagger-${i+2}`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-slate-50 rounded-xl">{stat.icon}</div>
              {stat.type !== 'system' && <div className="bg-indigo-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={10} /></div>}
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                {stat.label}
                <span className={`text-[8px] font-black ${stat.status === 'Good' || stat.status === 'Safe' ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {stat.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3 mt-4 opacity-0 animate-page stagger-4">
        <Link to="/ai-chat" className="flex items-center justify-between bg-indigo-600 rounded-2xl p-5 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 group active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
              <Camera size={24} />
            </div>
            <div>
              <span className="font-black text-sm block">Visual IQ Scan</span>
              <span className="text-[9px] font-bold uppercase opacity-60">AI Dashboard Analysis</span>
            </div>
          </div>
          <ChevronRight size={18} className="opacity-50" />
        </Link>

        <Link to="/diagnostics" className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-5 text-slate-900 hover:border-indigo-300 transition-all shadow-sm active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-indigo-600"><Activity size={20} /></div>
            <span className="font-black text-sm">Initiate System Scan</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </Link>
      </div>

      {activeLogType && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-page" onClick={() => setActiveLogType(null)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl animate-scale">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                Log {activeLogType}
              </h3>
              <button onClick={() => setActiveLogType(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
               <input 
                 type={activeLogType === 'mileage' || activeLogType === 'tire' ? 'number' : 'date'}
                 value={activeLogType === 'mileage' ? newMileage : (activeLogType === 'tire' ? logValue : logDate)}
                 onChange={(e) => {
                   if (activeLogType === 'mileage') setNewMileage(e.target.value);
                   else if (activeLogType === 'tire') setLogValue(e.target.value);
                   else setLogDate(e.target.value);
                 }}
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none text-center text-xl"
               />
              <button onClick={handleSaveLog} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                Commit to History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
