import React, { useState } from 'react';
import { Ticket, Clock, CheckCircle } from 'lucide-react';

export default function VirtualQueueCard({ zones, apiUrl }) {
  const [selectedZone, setSelectedZone] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async () => {
    if (!selectedZone) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-001', zoneId: selectedZone })
      });
      const data = await res.json();
      setTokenInfo(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Ticket className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold">Virtual Queue System</h2>
      </div>

      {!tokenInfo ? (
        <div className="space-y-4">
          <p className="text-sm var(--text-muted)">Avoid the lines. Generate a digital queue token.</p>
          <select 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            <option value="">Select a Destination</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name} (Wait: {z.waitTimeMin}m)</option>
            ))}
          </select>
          <button 
            disabled={!selectedZone || loading}
            onClick={handleRequestToken}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Generating...' : 'Get Queue Token'}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-5 flex flex-col items-center text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mb-2" />
          <h3 className="text-2xl font-black text-white px-4 py-1 bg-black/40 rounded-full">{tokenInfo.token}</h3>
          <p className="font-medium text-lg">{tokenInfo.zoneName}</p>
          <div className="flex items-center text-sm var(--text-muted) space-x-2">
            <Clock className="w-4 h-4" />
            <span>Est. Wait: ~{Math.round(tokenInfo.estimatedWaitMs / 1000)}s Demo Time</span>
          </div>
          <button 
            onClick={() => setTokenInfo(null)}
            className="mt-4 text-xs underline var(--text-muted) hover:text-white"
          >
            Request another token
          </button>
        </div>
      )}
    </div>
  );
}
