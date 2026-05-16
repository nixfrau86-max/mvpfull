import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="/MYLogo.png.png" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                The Collective Savers<span className="text-indigo-600">©</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-sm font-semibold transition-colors">
              Explore Waves©
            </Link>
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-sm font-semibold transition-colors">
                  Dashboard
                </Link>
                <Link to="/supplier" className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-sm font-semibold transition-colors">
                  Supplier
                </Link>
                <Link to="/admin" className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-sm font-semibold transition-colors">
                  Admin
                </Link>
                <button 
                  onClick={() => auth.signOut()}
                  className="ml-4 flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
