import { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, Lock, XCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const wavesQuery = query(collection(db, 'waves'), orderBy('createdAt', 'desc'));
  const [waves, loading] = useCollectionData(wavesQuery);

  const handleForceAction = async (waveId: string, action: 'forceLock' | 'forceFail') => {
    setProcessing(waveId);
    setMessage(null);
    try {
      // In a real app, we would include the admin bearer token here
      const response = await fetch(`https://us-central1-collective-savers.cloudfunctions.net/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({ waveId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action}`);
      }

      setMessage({ type: 'success', text: `Wave ${waveId} ${action === 'forceLock' ? 'locked' : 'failed'} successfully.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="text-center py-20">Loading admin console...</div>;

  return (
    <div className="bg-[#0b0c10] min-h-screen pb-20 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                <Shield className="h-6 w-6 text-rose-500" />
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">Admin Core™</h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm ml-12">System Override & Protocol Integrity</p>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] bg-rose-500/5 px-6 py-3 rounded-full border border-rose-500/20 backdrop-blur-md shadow-2xl">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_#f43f5e]"></div>
            <span>High Privilege Uplink Established</span>
          </div>
        </header>

        {message && (
          <div className={`mb-12 p-8 rounded-[3rem] flex items-center shadow-2xl animate-in fade-in slide-in-from-top-6 duration-500 border ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <div className={`p-3 rounded-2xl mr-6 ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <span className="font-black text-sm uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="bg-white/[0.02] rounded-[4rem] border border-white/5 overflow-hidden backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-10 py-10 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocol Target</th>
                  <th className="px-10 py-10 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Status Matrix</th>
                  <th className="px-10 py-10 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Engagement</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Override Vector™</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {waves?.map((wave: any) => (
                  <tr key={wave.waveId} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-10 py-10">
                      <div className="text-lg font-black text-white mb-2 uppercase tracking-tight group-hover:text-rose-500 transition-colors">{wave.productName}</div>
                      <div className="flex items-center space-x-4 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {wave.waveId.slice(0, 12)}...</span>
                        <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {wave.createdAt?.seconds ? format(new Date(wave.createdAt.seconds * 1000), 'MMM dd, HH:mm') : 'INITIATED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <span className={`px-5 py-2 inline-flex text-[9px] font-black rounded-full uppercase tracking-[0.3em] border ${
                        wave.status === 'active' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 
                        wave.status === 'locking' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                        wave.status === 'locked' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        wave.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-white/5 text-slate-600 border-white/10'
                      }`}>
                        {wave.status}
                      </span>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex items-end space-x-3 mb-3">
                        <span className="text-2xl font-black text-white leading-none">{wave.currentParticipants}</span>
                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest pb-0.5">/ {wave.threshold} Nodes</span>
                      </div>
                      <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                          style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right space-x-4">
                      {wave.status === 'active' ? (
                        <div className="flex items-center justify-end space-x-4">
                          <button
                            onClick={() => handleForceAction(wave.waveId, 'forceLock')}
                            disabled={!!processing}
                            className="inline-flex items-center px-6 py-3 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                          >
                            {processing === wave.waveId ? <RefreshCw className="h-3 w-3 animate-spin mr-3" /> : <Lock className="h-3 w-3 mr-3" />}
                            Execute Lock
                          </button>
                          <button
                            onClick={() => handleForceAction(wave.waveId, 'forceFail')}
                            disabled={!!processing}
                            className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                          >
                            {processing === wave.waveId ? <RefreshCw className="h-3 w-3 animate-spin mr-3" /> : <XCircle className="h-3 w-3 mr-3" />}
                            Abort
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em]">Protocol Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
