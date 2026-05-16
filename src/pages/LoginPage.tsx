import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'supplier'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate(role === 'user' ? '/dashboard' : '/supplier');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (role === 'user') {
          // Create user doc in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: name,
            createdAt: new Date().toISOString()
          });
          navigate('/dashboard');
        } else {
          // Create supplier doc in Firestore
          await setDoc(doc(db, 'suppliers', user.uid), {
            supplierId: user.uid,
            email: user.email,
            companyName: companyName || name,
            createdAt: new Date().toISOString()
          });
          navigate('/supplier');
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (role === 'user') {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'Anonymous',
            createdAt: new Date().toISOString()
          });
        }
        navigate('/dashboard');
      } else {
        const supplierDoc = await getDoc(doc(db, 'suppliers', user.uid));
        if (!supplierDoc.exists()) {
          await setDoc(doc(db, 'suppliers', user.uid), {
            supplierId: user.uid,
            email: user.email,
            companyName: user.displayName || 'Anonymous Supplier',
            createdAt: new Date().toISOString()
          });
        }
        navigate('/supplier');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100 blur-[120px] rounded-full opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-sky-100 blur-[120px] rounded-full opacity-50"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8">
            <img src="/MYLogo.png.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          
          <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setRole('user')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                role === 'user' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Member
            </button>
            <button
              onClick={() => setRole('supplier')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                role === 'supplier' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Supplier
            </button>
          </div>

          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {isLogin ? (role === 'user' ? 'Welcome Back©' : 'Supplier Login©') : 'Join the Wave©'}
          </h2>
          <p className="mt-4 text-slate-500 font-medium">
            {isLogin ? `Sign in as a ${role} to continue.` : `Register as a ${role} and start saving.`}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {!isLogin && (
              role === 'user' ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Company Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              )
            )}
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Secure Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              {isLogin ? 'Enter Dashboard©' : 'Create Account©'}
            </button>
          </div>
        </form>


        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-tighter">or continue with</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-full font-bold text-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-3" />
            Google Identity
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 font-medium">
          The Collective Savers© 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
