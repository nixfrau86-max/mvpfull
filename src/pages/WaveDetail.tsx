import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Clock, Shield, TrendingDown, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import WaveProgressVisualizer from '../components/WaveProgressVisualizer';

const WaveDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [wave] = useDocumentData(doc(db, 'waves', id || ''));

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, we'd call the backend to create a PaymentIntent
      // and then use Stripe Elements to collect payment info.
      // For this MVP, we'll simulate the call to /joinWave.
      
      const response = await fetch('https://us-central1-collective-savers.cloudfunctions.net/joinWave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waveId: id,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join wave');
      }

      const data = await response.json();
      console.log('Joined wave:', data);
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!wave) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="bg-[#0b0c10] min-h-screen py-16 sm:py-24 text-slate-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/[0.02] rounded-[4rem] shadow-2xl border border-white/[0.05] overflow-hidden backdrop-blur-3xl">
          <div className="lg:flex">
            {/* Left Column: Visuals & Info */}
            <div className="lg:w-3/5 relative overflow-hidden group min-h-[600px]">
              <img 
                src={wave.productName.toLowerCase().includes('tyre') ? '/product-premium-tyre.jpg' : '/product-premium-tech.jpg'} 
                alt={wave.productName}
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:mix-blend-normal group-hover:opacity-60 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/80 to-transparent"></div>
              
              <div className="relative z-10 h-full flex flex-col p-12 lg:p-20">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 mb-12 w-fit backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_#6366f1]"></span>
                  Active Protocol™
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tighter leading-[0.9]">
                  {wave.productName}
                </h1>
                
                <p className="text-slate-400 text-xl mb-16 leading-relaxed font-medium max-w-lg">
                  {wave.description}
                </p>

                <div className="mb-16 max-w-xl">
                  <WaveProgressVisualizer 
                    current={wave.currentParticipants || 0} 
                    target={wave.threshold} 
                    status={wave.status} 
                  />
                </div>
                
                <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex items-center group/item">
                    <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mr-6 group-hover/item:border-emerald-500/50 transition-all">
                      <Activity className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white font-black text-2xl tracking-tighter italic uppercase">
                        Protocol Linked
                      </div>
                      <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">System Integrated</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center group/item">
                    <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mr-6 group-hover/item:border-sky-500/50 transition-all">
                      <Clock className="h-6 w-6 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-white font-black text-2xl tracking-tighter italic uppercase">
                        {formatDistanceToNow(new Date(wave.deadline))}
                      </div>
                      <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Temporal Window Open</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Checkout & Action */}
            <div className="lg:w-2/5 p-12 lg:p-20 bg-white/[0.01] flex flex-col justify-center border-l border-white/[0.05]">
              <div className="mb-16">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 block">Net Acquisition Value™</span>
                <div className="flex items-baseline space-x-6">
                  <span className="text-8xl font-black text-white tracking-tighter italic">£{wave.basePrice}</span>
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-2xl font-black text-xs border border-emerald-500/20 flex items-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    SAVE 20%
                  </div>
                </div>
                <p className="mt-8 text-slate-500 font-medium leading-relaxed italic">
                  Institutional pricing unlocked via collective equilibrium. Protocol secured by multi-layer encryption.
                </p>
              </div>

              {wave.discountTiers && wave.discountTiers.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 opacity-40">Tiered Progression Matrix™</h3>
                  <div className="grid gap-6">
                    {wave.discountTiers.map((tier: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-4 shadow-[0_0_8px_#6366f1]"></div>
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{tier.participants}+ Nodes</span>
                        </div>
                        <span className="font-black text-xl text-white italic">£{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-10">
                {error && (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleJoin}
                  disabled={loading || wave.status !== 'active'}
                  className={`group relative w-full py-8 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 overflow-hidden shadow-2xl active:scale-95 ${
                    wave.status === 'active' 
                      ? 'bg-white text-slate-950 hover:bg-indigo-600 hover:text-white' 
                      : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span className="relative z-10">
                    {loading ? 'Authenticating Protocol...' : wave.status === 'active' ? 'Commit to Protocol™' : 'Protocol Inactive'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
                    <Shield className="h-3 w-3 mr-2 text-indigo-500" /> Layer-3 Secure Encryption
                  </div>
                  <p className="text-center text-[9px] leading-relaxed text-slate-600 max-w-xs font-bold uppercase tracking-tighter">
                    Pre-authorization hold: £{wave.basePrice}. No liquidity migration until threshold equilibrium achieved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveDetail;
