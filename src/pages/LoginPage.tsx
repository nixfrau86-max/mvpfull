import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const navigateToTarget = async (uid: string) => {
    const supplierDoc = await getDoc(doc(db, 'suppliers', uid));
    if (supplierDoc.exists()) {
      navigate('/supplier');
    } else if (email === 'admin@collectivesavers.com') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let uid = '';
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        uid = user.uid;
        
        // Create user doc in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: name,
          createdAt: new Date().toISOString()
        });
      }
      await navigateToTarget(uid);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Anonymous',
          createdAt: new Date().toISOString()
        });
      }
      await navigateToTarget(user.uid);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full opacity-50"></div>
      
      <div className="max-w-md w-full space-y-12 bg-white/[0.02] p-16 rounded-[4rem] shadow-2xl border border-white/5 relative z-10 backdrop-blur-3xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-950/40 border border-white/10 group hover:rotate-12 transition-transform duration-500">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">
            {isLogin ? 'Identity Verification™' : 'Node Enrollment™'}
          </h2>
          <p className="text-slate-500 font-medium tracking-tight uppercase text-[10px] tracking-[0.3em]">
            {isLogin ? 'Establishing secure uplink' : 'Initiate collective synchronization'}
          </p>
        </div>
        
        <form className="space-y-8" onSubmit={handleAuth}>
          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              Authorization Failed: {error}
            </div>
          )}
          
          <div className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-6">Full Designation</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-full p-5 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-6">Access Email</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/5 rounded-full p-5 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                placeholder="uplink@protocol.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-6">Secure Key</label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/5 rounded-full p-5 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-white text-slate-950 py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
            >
              {isLogin ? 'Authorize Entry™' : 'Confirm Enrollment™'}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[9px]">
            <span className="px-6 bg-[#0b0c10] text-slate-600 font-black uppercase tracking-[0.4em]">Alternative Routing</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 mr-4" />
            External ID
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            {isLogin ? "Request Enrollment" : "Return to Authorization"}
          </button>
        </div>
        
        <p className="text-center text-[8px] text-slate-700 font-black uppercase tracking-[0.5em]">
          Savers System™ 2026. SECURED.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
