import React from 'react';
import { motion } from 'framer-motion';

export default function Heatmap({ zones }) {
  // Color mapping based on status
  const getColor = (status) => {
    switch (status) {
      case 'Red': return 'bg-red-500/80 border-red-500';
      case 'Yellow': return 'bg-yellow-500/80 border-yellow-500';
      case 'Green': return 'bg-emerald-500/80 border-emerald-500';
      default: return 'bg-slate-500/80 border-slate-500';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {zones.map((zone) => (
        <motion.div
          key={zone.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col justify-between p-5 rounded-2xl border ${getColor(zone.status)} text-white shadow-lg`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg max-w-[70%]">{zone.name}</h3>
            <span className="text-xs font-bold px-2 py-1 bg-black/30 rounded-full">
              {zone.occupancy}/{zone.capacity}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm items-end">
              <span className="opacity-80">Est. Wait Time</span>
              <span className="font-bold text-xl">{zone.waitTimeMin} min</span>
            </div>
            
            {/* Tiny purely-visual bar */}
            <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mt-2">
              <motion.div 
                className="bg-white h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(zone.occupancy / zone.capacity) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
