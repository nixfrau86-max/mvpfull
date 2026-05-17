import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Clock, Users, Shield, TrendingDown, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';

const WaveDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [wave] = useDocumentData(doc(db, 'waves', id || ''));

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const supplierDoc = await getDoc(doc(db, 'suppliers', user.uid));
        if (supplierDoc.exists()) {
          navigate('/supplier');
        }
      }
    };
    checkRole();
  }, [user, navigate]);

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
    <div className="bg-[#fcfcfd] min-h-screen py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          <div className="lg:flex">
            {/* Left Column: Visuals & Info */}
            <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-20 relative overflow-hidden group">
              {wave.imageUrl && (
                <div className="absolute inset-0 z-0 opacity-40">
                  <img src={wave.imageUrl} alt={wave.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>
              )}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-500 blur-[100px] rounded-full"></div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-white/10 w-fit">
                    Live Opportunity©
                  </div>
                  {wave.sku && (
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/5 w-fit">
                      SKU: {wave.sku}
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                  {wave.productName}
                </h1>
                
                <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium">
                  {wave.description}
                </p>
                
                <div className="mt-auto space-y-8">
                  <div className="flex items-center group/item">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mr-6 group-hover/item:bg-indigo-600 transition-colors">
                      <Users className="h-6 w-6 text-indigo-400 group-hover/item:text-white" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl tracking-tight">
                        {wave.currentParticipants || 0} / {wave.threshold}
                      </div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Participants joined</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center group/item">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mr-6 group-hover/item:bg-sky-600 transition-colors">
                      <Clock className="h-6 w-6 text-sky-400 group-hover/item:text-white" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl tracking-tight">
                        {formatDistanceToNow(new Date(wave.deadline))} left
                      </div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Wave™ window closing</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center group/item">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mr-6 group-hover/item:bg-emerald-600 transition-colors">
                      <Shield className="h-6 w-6 text-emerald-400 group-hover/item:text-white" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl tracking-tight">
                        Secured Pre-Auth©
                      </div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">No charge unless successful</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Checkout & Action */}
            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
              <div className="mb-12">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Exclusive Member Price©</span>
                <div className="flex items-baseline space-x-4">
                  <span className="text-7xl font-black text-slate-900 tracking-tighter italic">£{wave.basePrice}</span>
                  <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-sm border border-emerald-100 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    SAVE £{Math.round(wave.basePrice * 0.2)}
                  </div>
                </div>
                <p className="mt-4 text-slate-500 font-medium leading-relaxed">
                  Join the collective power of our members to unlock this exclusive bulk price. No individual can match this rate.
                </p>
              </div>

              {wave.discountTiers && wave.discountTiers.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Tiered Savings Progression©</h3>
                  <div className="grid gap-4">
                    {wave.discountTiers.map((tier: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mr-4"></div>
                          <span className="text-sm font-bold text-slate-600">{tier.participants}+ Participants</span>
                        </div>
                        <span className="font-black text-indigo-600">£{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 text-sm font-bold">
                  <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <button
                  onClick={handleJoin}
                  disabled={loading || wave.status !== 'active'}
                  className={`w-full py-6 rounded-full font-black text-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest ${
                    wave.status === 'active' 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30' 
                      : wave.status === 'locking'
                      ? 'bg-amber-500 text-white cursor-not-allowed'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    wave.status === 'active' ? 'Commit to Wave™' : wave.status === 'locking' ? 'Locking Wave™...' : 'Wave™ Inactive'
                  )}
                </button>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <Shield className="h-3 w-3 mr-2" /> 100% Secured by Stripe
                  </div>
                  <p className="text-center text-[10px] leading-relaxed text-slate-400 max-w-xs font-medium">
                    By committing, you authorize a £{wave.basePrice} hold. Zero funds leave your account until the Wave™ successfully locks with {wave.threshold} members.
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
