import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, XCircle, RefreshCw, CheckCircle, Users, Truck, Activity } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'waves' | 'members' | 'suppliers'>('waves');
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin-login');
    }
  }, [user, authLoading, navigate]);

  const wavesQuery = query(collection(db, 'waves'), orderBy('createdAt', 'desc'));
  const [waves, loadingWaves] = useCollectionData(wavesQuery);

  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const [users, loadingUsers] = useCollectionData(usersQuery);

  const suppliersQuery = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'));
  const [suppliers, loadingSuppliers] = useCollectionData(suppliersQuery);

  const handleForceAction = async (waveId: string, action: 'forceLock' | 'forceFail') => {
    setProcessing(waveId);
    setMessage(null);
    try {
      const response = await fetch(`https://us-central1-collective-savers.cloudfunctions.net/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ waveId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action}`);
      }

      setMessage({ type: 'success', text: `Wave ${waveId} ${action === 'forceLock' ? 'locked' : 'failed'} successfully.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(null);
    }
  };

  const loading = loadingWaves || loadingUsers || loadingSuppliers;

  if (loading) return <div className="text-center py-20">Loading admin console...</div>;

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-rose-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-rose-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console©</h1>
            </div>
            <p className="text-slate-500 font-medium">System-wide monitoring and critical overrides.</p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
            <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
            <span>High Privilege Access</span>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('waves')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'waves' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Waves</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'members' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Members</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'suppliers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Distributors</span>
          </button>
        </div>

        {message && (
          <div className={`mb-10 p-6 rounded-[2rem] flex items-center shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
          }`}>
            <div className={`p-2 rounded-xl mr-4 ${message.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'waves' && (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Wave Target</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Override©</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {waves?.map((wave: any) => (
                    <tr key={wave.waveId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900 mb-1">{wave.productName}</div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">ID: {wave.waveId.slice(0, 8)}...</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {wave.createdAt?.seconds ? format(new Date(wave.createdAt.seconds * 1000), 'MMM dd, HH:mm') : 'Recently'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 inline-flex text-[10px] leading-5 font-black rounded-full uppercase tracking-widest ${
                          wave.status === 'active' ? 'bg-indigo-50 text-indigo-700' : 
                          wave.status === 'locking' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                          wave.status === 'locked' ? 'bg-emerald-50 text-emerald-700' : 
                          wave.status === 'failed' ? 'bg-rose-50 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {wave.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900">{wave.currentParticipants}</span>
                          <span className="text-slate-400 text-xs">/ {wave.threshold}</span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full" 
                            style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-3">
                        {wave.status === 'active' ? (
                          <>
                            <button
                              onClick={() => handleForceAction(wave.waveId, 'forceLock')}
                              disabled={!!processing}
                              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
                            >
                              {processing === wave.waveId ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <Lock className="h-3 w-3 mr-2" />}
                              Lock
                            </button>
                            <button
                              onClick={() => handleForceAction(wave.waveId, 'forceFail')}
                              disabled={!!processing}
                              className="inline-flex items-center px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50"
                            >
                              {processing === wave.waveId ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <XCircle className="h-3 w-3 mr-2" />}
                              Fail
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Action Required</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'members' && (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users?.map((user: any) => (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-slate-900">{user.name}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{user.email}</td>
                      <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {user.createdAt?.seconds ? format(new Date(user.createdAt.seconds * 1000), 'MMM dd, yyyy') : 'Long ago'}
                      </td>
                    </tr>
                  ))}
                  {(!users || users.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-400 text-sm font-medium">No members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'suppliers' && (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Distributor</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Bond Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {suppliers?.map((supplier: any) => (
                    <tr key={supplier.supplierId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900 mb-1">{supplier.companyName}</div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Connect: {supplier.stripeConnectAccountId || 'Not linked'}</div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{supplier.email}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 inline-flex text-[10px] leading-5 font-black rounded-full uppercase tracking-widest ${
                          supplier.performanceBondPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {supplier.performanceBondPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {supplier.createdAt?.seconds ? format(new Date(supplier.createdAt.seconds * 1000), 'MMM dd, yyyy') : 'Long ago'}
                      </td>
                    </tr>
                  ))}
                  {(!suppliers || suppliers.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 text-sm font-medium">No distributors found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
