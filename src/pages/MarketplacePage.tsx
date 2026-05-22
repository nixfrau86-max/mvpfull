import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

const MarketplacePage = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const wavesQuery = query(collection(db, 'waves'), where('status', '==', 'active'));
  const [waves, loading, error] = useCollectionData(wavesQuery);

  useEffect(() => {
    const checkSupplierRedirect = async () => {
      if (user) {
        const supplierDoc = await getDoc(doc(db, 'suppliers', user.uid));
        if (supplierDoc.exists()) {
          navigate('/supplier');
        }
      }
    };
    checkSupplierRedirect();
  }, [user, navigate]);

  return (
    <div className="bg-[#0b0c10] min-h-screen text-slate-300 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Operational Waves™</h2>
            <p className="text-slate-500 mt-4 text-lg font-medium">Real-time collective buying protocols currently active.</p>
          </div>
          <div className="h-px flex-grow bg-white/5 mx-12 hidden md:block"></div>
        </div>
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[500px] rounded-[3rem] bg-white/[0.02] animate-pulse border border-white/5"></div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="text-center py-20 rounded-[3rem] bg-red-500/5 border border-red-500/10 text-red-500">
            <p className="font-black text-xs uppercase tracking-widest">System Error: Protocol Retrieval Failed</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {waves?.map((wave: any) => (
            <Link 
              key={wave.waveId} 
              to={`/wave/${wave.waveId}`}
              className="group relative bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-2xl hover:border-indigo-500/30 hover:-translate-y-4 transition-all duration-700 overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                <img 
                  src={wave.productName.toLowerCase().includes('tyre') ? '/product-premium-tyre.jpg' : '/product-premium-tech.jpg'} 
                  alt={wave.productName}
                  className="w-full h-full object-cover mix-blend-luminosity opacity-50 group-hover:mix-blend-normal group-hover:opacity-80 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent"></div>
                
                <div className="absolute top-6 left-6 flex space-x-2">
                  <div className="px-3 py-1 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Active</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 opacity-60">Entry Value</div>
                  <div className="text-4xl font-black text-white tracking-tighter italic">£{wave.basePrice}</div>
                </div>
              </div>

              <div className="p-10 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors uppercase">
                    {wave.productName}
                  </h3>
                </div>
                
                <p className="text-slate-500 mb-10 line-clamp-2 text-sm leading-relaxed font-medium italic">
                  {wave.description}
                </p>
                
                <div className="mt-auto space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Protocol engagement</span>
                        <div className="flex items-center space-x-2">
                          <Users className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="text-sm font-black text-white">{wave.currentParticipants || 0} / {wave.threshold}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20 px-3 py-1 rounded-full">
                          Collective Active™
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.6)]" 
                        style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center text-slate-600 text-[9px] font-black uppercase tracking-[0.2em]">
                      <Clock className="h-3 w-3 mr-2 text-indigo-500" />
                      {formatDistanceToNow(new Date(wave.deadline))} left
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-500 group-hover:rotate-[360deg]">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {waves?.length === 0 && !loading && (
            <div className="col-span-full text-center py-32 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No active Waves™ right now</h3>
              <p className="text-slate-500 mt-2">The next big opportunity is coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
