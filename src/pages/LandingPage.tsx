import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LandingPage = () => {
  const wavesQuery = query(collection(db, 'waves'), where('status', '==', 'active'));
  const [waves, loading, error] = useCollectionData(wavesQuery);

  return (
    <div className="bg-[#fcfcfd] min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <img
          src="/hero-bg.jpg"
          alt="Premium background"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6">
              Buy together, <span className="text-indigo-400 italic">save</span> together.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300 max-w-xl mx-auto">
              Join collective Waves© and unlock bulk pricing without the commitment of subscriptions. The power of the crowd, delivered to your door.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="rounded-full bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
              >
                Start Saving Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Waves List */}
      <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active Waves©</h2>
            <p className="text-slate-500 mt-2 text-lg">Limited-time collective buying opportunities available now.</p>
          </div>
          <div className="h-px flex-grow bg-slate-100 mx-8 hidden md:block"></div>
        </div>
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="text-center py-20 rounded-3xl bg-red-50 border border-red-100 text-red-600">
            <p className="font-semibold text-lg">Unable to load Waves at this time.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {waves?.map((wave: any) => (
            <Link 
              key={wave.waveId} 
              to={`/wave/${wave.waveId}`}
              className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full"
            >
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100">
                    Active Wave©
                  </div>
                  <div className="flex items-center text-slate-400 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {formatDistanceToNow(new Date(wave.deadline))} left
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {wave.productName}
                </h3>
                
                <p className="text-slate-500 mb-8 line-clamp-2 text-sm leading-relaxed">
                  {wave.description}
                </p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Price per member</span>
                      <div className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        £{wave.basePrice}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-lg">
                        SAVE {Math.round((wave.basePrice * 0.2))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      <span>{wave.currentParticipants || 0} Joined</span>
                      <span>Target: {wave.threshold}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 bg-slate-50 flex items-center justify-between group-hover:bg-indigo-600 transition-colors">
                <span className="text-slate-900 group-hover:text-white font-bold text-sm transition-colors">Join this Wave©</span>
                <ArrowRight className="h-5 w-5 text-indigo-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
          
          {waves?.length === 0 && !loading && (
            <div className="col-span-full text-center py-32 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No active Waves© right now</h3>
              <p className="text-slate-500 mt-2">The next big opportunity is coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
