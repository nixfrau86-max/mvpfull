import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertTriangle } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // In a real app, we would verify admin claims here. 
      // For MVP, we assume any user logging in through this portal is an admin.
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      setError('Access Denied: Invalid credentials or insufficient privileges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dark mode admin aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.05),transparent)] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
            <Shield className="h-10 w-10 text-rose-500" />
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Terminal Access©
          </h2>
          <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
            High-Privilege Collective Management
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleAdminLogin}>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center">
              <AlertTriangle className="h-4 w-4 mr-3 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Admin Identifier</label>
              <input
                type="email"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white font-semibold focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                placeholder="admin@collectivesavers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Security Key</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white font-semibold focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center group disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Establish Connection <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-300 transition-colors"
          >
            Return to Public Hub
          </button>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter italic">V4.2.0 Secured</span>
          <div className="flex space-x-2">
            <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
