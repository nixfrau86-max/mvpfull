import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

const LandingPage = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

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
    <div className="bg-[#0b0c10] min-h-screen text-slate-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-950 py-32 sm:py-48">
        <img
          src="/hero-cinematic.jpg"
          alt="Premium background"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40 mix-blend-overlay scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-[#0b0c10]"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Exclusive Collective Power™</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white sm:text-8xl mb-8 leading-[0.9]">
              Buy together, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400 italic">save</span> together.
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-xl mx-auto font-medium">
              Engage institutional-grade collective power. <br />No subscriptions. Just raw purchasing force.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-8">
              <Link
                to="/login"
                className="group relative px-12 py-5 bg-white text-slate-950 rounded-full font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Enter the Collective
                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
