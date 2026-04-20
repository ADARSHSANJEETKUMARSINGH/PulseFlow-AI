"use client";

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Heatmap from './Heatmap';
import VirtualQueueCard from './VirtualQueueCard';
import SmartExitCard from './SmartExitCard';
import { Activity, Users, Zap, LayoutDashboard } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

export default function LiveDashboard() {
  const [venueState, setVenueState] = useState(null);
  const [redirectSuggestions, setRedirectSuggestions] = useState([]);
  const [exitPlan, setExitPlan] = useState(null);
  const [queueNotifications, setQueueNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [theme, setTheme] = useState('Sports'); // Sports or Professional

  useEffect(() => {
    // Sync theme to body
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('live-pulse-update', (data) => {
      setVenueState(data);
    });

    socket.on('smart-redirect', (suggestions) => {
      setRedirectSuggestions(suggestions);
    });

    socket.on('smart-exit-plan', (plan) => {
      setExitPlan(plan);
    });

    socket.on('queue-notification', (notif) => {
      setQueueNotifications((prev) => [...prev, notif]);
      // Remove notification after 5 seconds
      setTimeout(() => {
        setQueueNotifications((prev) => prev.filter(n => n !== notif));
      }, 5000);
    });

    return () => socket.disconnect();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'Sports' ? 'Professional' : 'Sports');
  };

  const handleRunSmartExit = async () => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/smart-exit`, { method: 'POST' });
      const data = await res.json();
      setExitPlan(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!venueState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalOccupancy = venueState.zones.reduce((sum, z) => sum + z.occupancy, 0);
  const totalCapacity = venueState.zones.reduce((sum, z) => sum + z.capacity, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center glass-card p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              PulseFlow AI
            </h1>
            <p className="text-sm var(--text-muted) flex items-center space-x-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 pulse-anim' : 'bg-red-500'}`} />
              <span>Live System Pulse</span>
            </p>
          </div>
        </div>

        <div className="flex space-x-4 mt-4 md:mt-0">
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 rounded-full font-medium border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-white/10 transition-colors"
          >
            {theme} Mode
          </button>
          
          <button 
            onClick={handleRunSmartExit}
            className="px-6 py-2 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Init Smart Exit</span>
          </button>
        </div>
      </header>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-center items-center">
          <Users className="w-8 h-8 mb-4 text-emerald-400" />
          <h3 className="text-4xl font-bold">{totalOccupancy}</h3>
          <p className="text-sm var(--text-muted) mt-2">Total Venue Occupancy</p>
          <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500" 
              style={{ width: `${(totalOccupancy / totalCapacity) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center items-center col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-32 h-32" />
          </div>
          <h2 className="text-xl font-bold mb-4 w-full text-left z-10">AI Smart Redirect Suggestions</h2>
          <div className="w-full space-y-3 z-10 flex-grow">
            {redirectSuggestions.length > 0 ? (
              redirectSuggestions.map((sug, idx) => (
                <div key={idx} className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{sug.message}</p>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-muted)] italic">
                No current bottlenecks detected. Traffic flow optimal.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid for Heatmap and Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
          <h2 className="text-xl font-bold mb-6">Live Density Heatmap</h2>
          <Heatmap zones={venueState.zones} />
        </div>
        
        <div className="space-y-6">
          <VirtualQueueCard zones={venueState.zones} apiUrl={SOCKET_URL} />
          {exitPlan && <SmartExitCard plan={exitPlan} />}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {queueNotifications.map((notif, idx) => (
          <div key={idx} className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl border border-green-400 flex items-center space-x-3 animate-bounce">
            <Activity className="w-5 h-5" />
            <p className="font-medium">{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
