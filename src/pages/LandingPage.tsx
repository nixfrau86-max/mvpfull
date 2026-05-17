import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Zap, Target, Lock, BarChart3, ChevronRight } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';

const LandingPage = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

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

  return (
    <div className="bg-[#0a0c10] min-h-screen text-slate-300 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Cinematic Hero */}
      <div className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-3 mb-8 py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-in fade-in slide-in-from-left-4 duration-700">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Next-Gen Collective Buying©</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              PURCHASE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 italic">
                AS A COLLECTIVE.
              </span>
            </h1>

            <p className="text-xl md:text-2xl leading-relaxed text-slate-400 mb-12 font-medium max-w-2xl animate-in fade-in duration-1000 delay-300">
              Unlock pre-negotiated bulk pricing on premium automotive and tech assets. No subscriptions. No direct contact. Just pure volume power.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in duration-1000 delay-500">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="group w-full sm:w-auto inline-flex items-center justify-center px-12 py-6 text-lg font-black text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] active:scale-95"
              >
                {user ? "ENTER MARKETPLACE™" : "JOIN THE COLLECTIVE™"}
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="group text-slate-500 font-black text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center"
              >
                View Protocol <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Section */}
      <section id="how-it-works" className="py-32 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Select Asset</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Browse our pre-authorized distributor templates. Tyres, Tech, and Industrial components ready for volume activation.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Activate Wave™</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Commit your pre-authorization. Your funds are only locked once the collective threshold is reached. Absolute price integrity.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Blind Mediator</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                We handle the fulfillment bridge. Suppliers never see your data until the wave is secured. Total privacy by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <span className="text-xl font-black tracking-tighter text-white">STRIPE_SECURED</span>
            <span className="text-xl font-black tracking-tighter text-white">FIREBASE_REALTIME</span>
            <span className="text-xl font-black tracking-tighter text-white">COLLECTIVE_POWER©</span>
          </div>
          <div className="mt-12">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              Licensed Operational Proxy for High-Performance Distribution
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-indigo-600/5 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight uppercase">
            Ready to initiate <br />
            your first Wave™?
          </h2>
          <div className="flex flex-col items-center">
            <Link
              to="/login"
              className="px-16 py-6 bg-white text-slate-950 rounded-full font-black text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              ACCESS CONSOLE
            </Link>
            <div className="mt-8 flex items-center space-x-3 text-emerald-500/80 bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10">
              <ShieldAlert size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Strict Privacy Policy© Active</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
