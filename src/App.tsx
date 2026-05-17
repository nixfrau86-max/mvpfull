import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard'));
const WaveDetail = lazy(() => import('./pages/WaveDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 text-slate-900">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<MemberDashboard />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/supplier" element={<SupplierDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/wave/:id" element={<WaveDetail />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="bg-white border-t border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/Collectivesaverslogo.png.png" alt="The Collective Savers© Logo" className="w-10 h-10 object-contain" />
                </div>
                <span className="font-black text-slate-900 tracking-tight">The Collective Savers©</span>
              </div>
              <div className="flex space-x-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
                <Link to="/admin-login" className="hover:text-rose-600 transition-colors">Admin Console©</Link>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                &copy; {new Date().getFullYear()} The Collective Savers©. Premium Collective Buying.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
