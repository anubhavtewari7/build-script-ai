
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import DiagnosticTool from './pages/DiagnosticTool';
import AIChat from './pages/AIChat';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Welcome from './pages/Welcome';
import Modifications from './pages/Modifications';
import { Vehicle, SubscriptionTier } from './types';

const INITIAL_VEHICLE: Vehicle = {
  id: '1',
  make: 'Jeep',
  model: 'Cherokee Latitude',
  year: 2015,
  mileage: 170000,
  vin: '1J4NJ2FB6FLXXXXXX',
  fuelType: 'gas'
};

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('bs_vehicles');
    return saved ? JSON.parse(saved) : [INITIAL_VEHICLE];
  });
  
  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    return localStorage.getItem('bs_active_vehicle_id') || '1';
  });

  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(() => {
    return (localStorage.getItem('bs_subscription') as SubscriptionTier) || 'free';
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(() => {
    return localStorage.getItem('bs_authenticated') === 'true';
  });
  
  useEffect(() => {
    localStorage.setItem('bs_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('bs_active_vehicle_id', activeVehicleId);
  }, [activeVehicleId]);

  useEffect(() => {
    localStorage.setItem('bs_subscription', subscriptionTier);
  }, [subscriptionTier]);

  const handleAuthComplete = (userData: {name: string, email: string, initialVehicle?: Vehicle}) => {
    setIsInitialized(true);
    localStorage.setItem('bs_authenticated', 'true');
    
    if (userData.initialVehicle) {
      setVehicles([userData.initialVehicle]);
      setActiveVehicleId(userData.initialVehicle.id);
    }
    
    if (!localStorage.getItem('bs_user_account')) {
      const { initialVehicle, ...profile } = userData;
      localStorage.setItem('bs_user_account', JSON.stringify(profile));
    }
  };

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];

  const updateVehicle = (updated: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const addVehicle = (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
    setActiveVehicleId(newVehicle.id);
  };

  if (!isInitialized) {
    return (
      <div className="max-w-md mx-auto shadow-2xl">
        <Welcome onAuthComplete={handleAuthComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto bg-slate-50 shadow-xl ring-1 ring-slate-900/5">
      <Routes>
        <Route path="/" element={<Dashboard vehicle={activeVehicle} onUpdateVehicle={updateVehicle} />} />
        <Route path="/diagnostics" element={<DiagnosticTool vehicle={activeVehicle} />} />
        <Route path="/modifications" element={<Modifications vehicle={activeVehicle} subscriptionTier={subscriptionTier} />} />
        <Route path="/ai-chat" element={<AIChat vehicle={activeVehicle} />} />
        <Route path="/maintenance" element={<Maintenance vehicle={activeVehicle} />} />
        <Route 
          path="/profile" 
          element={
            <Profile 
              vehicles={vehicles} 
              activeVehicleId={activeVehicleId}
              subscriptionTier={subscriptionTier}
              onUpdateVehicle={updateVehicle} 
              onAddVehicle={addVehicle}
              onSwitchVehicle={setActiveVehicleId}
              onUpdateSubscription={setSubscriptionTier}
            />
          } 
        />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      <Navigation />
    </div>
  );
};

export default App;
