import React from 'react';
import { ShieldCheck, ArrowRightCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartExitCard({ plan }) {
  if (!plan) return null;

  return (
    <div className="glass-card p-6 bg-emerald-900/10 border-emerald-500/20">
      <div className="flex items-center space-x-3 mb-4 text-emerald-400">
        <ShieldCheck className="w-6 h-6" />
        <h2 className="text-xl font-bold">Active Smart Exit Plan</h2>
      </div>
      
      <p className="text-sm mb-4 opacity-90">{plan.recommendation}</p>

      <div className="space-y-3 mt-4">
        {plan.waves.map((wave) => (
          <motion.div 
            key={wave.waveId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: wave.waveId * 0.1 }}
            className={`p-3 rounded-lg flex items-center justify-between border ${
              wave.status === 'Ready to Exit' 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <p className="font-bold text-sm">Wave {wave.waveId}</p>
              <p className="text-xs">{wave.targetSeats}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium uppercase tracking-wider">{wave.status}</span>
              {wave.status === 'Ready to Exit' && <ArrowRightCircle className="w-5 h-5 text-emerald-400" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
