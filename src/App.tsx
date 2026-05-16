import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MemberDashboard from './pages/MemberDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import WaveDetail from './pages/WaveDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/supplier" element={<SupplierDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/wave/:id" element={<WaveDetail />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/Collectivesaverslogo.png.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <span className="font-black text-slate-900 tracking-tight">The Collective Savers©</span>
              </div>
              <div className="flex space-x-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Supplier Terms</a>
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
