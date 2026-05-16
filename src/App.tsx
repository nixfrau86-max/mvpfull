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
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
        <footer className="bg-white border-t py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Collective Savers. No subscriptions, just collective power.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
