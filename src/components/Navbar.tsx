import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const supplierDoc = await getDoc(doc(db, 'suppliers', user.uid));
        setIsSupplier(supplierDoc.exists());
        setIsAdmin(user.email === 'admin@collectivesavers.com');
      } else {
        setIsSupplier(false);
        setIsAdmin(false);
      }
    };
    checkRole();
  }, [user]);

  return (
    <nav className="bg-[#0b0c10]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex">
            <Link 
              to={isSupplier ? "/supplier" : "/"} 
              className="flex-shrink-0 flex items-center space-x-4 group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all duration-500 group-hover:rotate-[15deg]">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert opacity-80 group-hover:opacity-100" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter text-white uppercase leading-none">
                  Savers<span className="text-indigo-500">™</span>
                </span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Collective</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-10">
            {!isSupplier && (
              <Link to="/" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                Marketplace™
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-8">
                {isAdmin ? (
                  <Link to="/admin" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                    Admin
                  </Link>
                ) : isSupplier ? (
                  <Link to="/supplier" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                    Supply
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                    Console
                  </Link>
                )}
                <button 
                  onClick={() => auth.signOut()}
                  className="ml-6 flex items-center bg-white text-slate-950 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Terminate
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-indigo-600 text-white px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/40 active:scale-95"
              >
                Access System
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;