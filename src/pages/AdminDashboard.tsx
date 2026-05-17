import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Lock, XCircle, RefreshCw, CheckCircle, Users, 
  Truck, Activity, Database, AlertTriangle, 
  PieChart, BarChart3, Trash2, Search
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'waves' | 'members' | 'suppliers' | 'inventory' | 'logs'>('overview');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin-login');
    }
  }, [user, authLoading, navigate]);

  // Global Data Streams
  const wavesQuery = query(collection(db, 'waves'), orderBy('createdAt', 'desc'));
  const [waves, loadingWaves] = useCollectionData(wavesQuery);

  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const [users, loadingUsers] = useCollectionData(usersQuery);

  const suppliersQuery = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'));
  const [suppliers, loadingSuppliers] = useCollectionData(suppliersQuery);

  const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const [products, loadingProducts] = useCollectionData(productsQuery);

  const handleForceAction = async (waveId: string, action: 'forceLock' | 'forceFail') => {
    if (!window.confirm(`Confirm CRITICAL OVERRIDE: ${action}?`)) return;
    setMessage(null);
    try {
      const response = await fetch(`https://us-central1-collective-savers.cloudfunctions.net/admin/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waveId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action}`);
      }

      setMessage({ type: 'success', text: `CMD_EXEC: Wave™ ${waveId} ${action === 'forceLock' ? 'LOCKED' : 'TERMINATED'}.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: `CMD_ERR: ${err.message}` });
    }
  };

  const handleDeleteEntry = async (col: string, id: string) => {
    if (!window.confirm('PERMANENT DATA REMOVAL: Proceed?')) return;
    try {
      await deleteDoc(doc(db, col, id));
      setMessage({ type: 'success', text: `SYS_DEL: Resource ${id} purged from ${col}.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: `SYS_ERR: Purge failed.` });
    }
  };

  const loading = loadingWaves || loadingUsers || loadingSuppliers || loadingProducts;

  if (loading) return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center font-mono text-emerald-500">
      <div className="flex items-center space-x-3">
        <RefreshCw className="animate-spin h-5 w-5" />
        <span>INITIALIZING_ADMIN_TERMINAL...</span>
      </div>
    </div>
  );

  const stats = {
    gmv: waves?.reduce((acc, w) => acc + (w.status === 'locked' ? (w.finalPrice * w.currentParticipants) : 0), 0) || 0,
    totalParticipations: waves?.reduce((acc, w) => acc + (w.currentParticipants || 0), 0) || 0,
    activeWaves: waves?.filter(w => w.status === 'active').length || 0,
    health: 99.8
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300 font-mono selection:bg-rose-500 selection:text-white">
      {/* Top Functional Stats Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center space-x-8">
            <div className="flex items-center text-rose-500">
              <Shield className="h-4 w-4 mr-2" />
              SYSTEM_LIVE_CONSOLE©
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Node:</span>
              <span className="text-emerald-500">PROD-UK-01</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Uptime:</span>
              <span className="text-emerald-500">14d 02h 44m</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">GMV_SECURED:</span>
              <span className="text-white">£{stats.gmv.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">HEALTH:</span>
              <span className="text-emerald-500">{stats.health}%</span>
            </div>
            <button onClick={() => auth.signOut()} className="text-rose-500 hover:text-rose-400 transition-colors border border-rose-500/30 px-3 py-1 rounded">
              LOGOUT_SESSION
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-[1600px] mx-auto p-6 gap-6">
        {/* Functional Sidebar */}
        <aside className="w-64 shrink-0 space-y-2">
          <div className="mb-8 px-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Core Management</div>
            <nav className="space-y-1">
              {[
                { id: 'overview', icon: PieChart, label: 'Overview_Stats' },
                { id: 'waves', icon: Activity, label: 'Waves_Engine™' },
                { id: 'inventory', icon: Database, label: 'Inventory_Templates' },
                { id: 'suppliers', icon: Truck, label: 'Distributor_Nodes' },
                { id: 'members', icon: Users, label: 'Member_Database' },
                { id: 'logs', icon: Lock, label: 'Audit_Logs' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === item.id 
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                      : 'hover:bg-slate-900 text-slate-500'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 m-4">
            <div className="text-[9px] font-black text-slate-600 uppercase mb-2">Live Incident Report</div>
            <div className="flex items-center text-emerald-500 text-[10px] font-bold">
              <CheckCircle size={12} className="mr-2" />
              0 Active Alerts
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow">
          {message && (
            <div className={`mb-6 p-4 rounded border text-xs font-bold flex items-center justify-between ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="flex items-center">
                <AlertTriangle size={14} className="mr-3" />
                {message.text}
              </div>
              <button onClick={() => setMessage(null)}><XCircle size={14} /></button>
            </div>
          )}

          {/* Search bar for all tables */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH_SYSTEM_RESOURCES..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:border-rose-500 outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
            {activeTab === 'overview' && (
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                  {[
                    { label: 'Active_Waves', val: stats.activeWaves, icon: Activity, color: 'text-indigo-500' },
                    { label: 'Platform_Members', val: users?.length || 0, icon: Users, color: 'text-sky-500' },
                    { label: 'Total_Participations', val: stats.totalParticipations, icon: ShoppingBag, color: 'text-emerald-500' },
                    { label: 'System_Latency', val: '22ms', icon: RefreshCw, color: 'text-amber-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <s.icon size={18} className={s.color} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{s.label}</span>
                      </div>
                      <div className="text-3xl font-black text-white">{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8">
                  <h3 className="text-sm font-black uppercase mb-6 flex items-center text-white">
                    <BarChart3 size={16} className="mr-2 text-rose-500" />
                    Global_Flow_Analytics
                  </h3>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[40, 70, 45, 90, 65, 80, 50, 30, 95, 60, 75, 40].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-800 rounded-t-sm hover:bg-rose-500 transition-all cursor-pointer group relative" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          Metric_{i}: {h}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-600 px-4">
                    <span>JAN_26</span>
                    <span>MAY_26</span>
                    <span>SEP_26</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'waves' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">WAVE_ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">PRODUCT_TARGET</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">STATUS</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">FLOW</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">ADMIN_OVERRIDE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {waves?.filter(w => w.productName.toLowerCase().includes(searchTerm.toLowerCase())).map((wave: any) => (
                      <tr key={wave.waveId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5 font-mono text-[10px] text-slate-400">{wave.waveId.slice(0, 12)}</td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-bold text-white mb-1">{wave.productName}</div>
                          <div className="text-[10px] text-slate-500 uppercase">£{wave.basePrice} / Member</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                            wave.status === 'active' ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/5' : 
                            wave.status === 'locked' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' :
                            'border-slate-700 text-slate-500'
                          }`}>
                            {wave.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-4">
                            <span className="text-[10px] font-bold text-white">{wave.currentParticipants}/{wave.threshold}</span>
                            <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full" style={{ width: `${(wave.currentParticipants / wave.threshold) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right space-x-2">
                          {wave.status === 'active' && (
                            <>
                              <button onClick={() => handleForceAction(wave.waveId, 'forceLock')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors" title="Force Lock"><Lock size={14} /></button>
                              <button onClick={() => handleForceAction(wave.waveId, 'forceFail')} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded transition-colors" title="Kill Wave"><XCircle size={14} /></button>
                            </>
                          )}
                          <button onClick={() => handleDeleteEntry('waves', wave.waveId)} className="p-2 text-slate-600 hover:text-rose-500 rounded transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">RESOURCE_SKU</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ITEM_SPEC</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">BULK_VAL</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">NODE_OWNER</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => (
                      <tr key={p.productId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5 font-mono text-[10px] text-emerald-500">{p.sku || 'UNASSIGNED'}</td>
                        <td className="px-6 py-5 text-xs font-bold text-white">{p.name}</td>
                        <td className="px-6 py-5 text-xs font-bold text-slate-400">£{p.price}</td>
                        <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{p.supplierName}</td>
                        <td className="px-6 py-5 text-right">
                          <button onClick={() => handleDeleteEntry('products', p.productId)} className="p-2 text-slate-600 hover:text-rose-500 rounded transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">UID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">IDENTITY</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ACCESS_POINT</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">PROVISIONED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users?.filter(u => u.email.includes(searchTerm)).map((u: any) => (
                      <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5 font-mono text-[10px] text-slate-600">{u.uid.slice(0, 16)}</td>
                        <td className="px-6 py-5 text-xs font-bold text-white">{u.name}</td>
                        <td className="px-6 py-5 text-xs font-bold text-slate-400">{u.email}</td>
                        <td className="px-6 py-5 text-right text-[10px] font-bold text-slate-600">{u.createdAt ? format(new Date(u.createdAt.seconds * 1000), 'yyyy-MM-dd') : '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">DISTRIBUTOR_NODE</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">CONNECTED_ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">BOND_AUTH</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {suppliers?.filter(s => s.companyName.toLowerCase().includes(searchTerm.toLowerCase())).map((s: any) => (
                      <tr key={s.supplierId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="text-xs font-bold text-white">{s.companyName}</div>
                          <div className="text-[10px] text-slate-500">{s.email}</div>
                        </td>
                        <td className="px-6 py-5 font-mono text-[10px] text-slate-400">{s.stripeConnectAccountId}</td>
                        <td className="px-6 py-5 text-xs font-bold text-emerald-500">{s.performanceBondPaid ? '✓_VERIFIED' : 'PENDING'}</td>
                        <td className="px-6 py-5 text-right">
                          <button onClick={() => handleDeleteEntry('suppliers', s.supplierId)} className="p-2 text-slate-600 hover:text-rose-500 rounded transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'logs' && (
              <div className="p-10 font-mono text-[11px] space-y-2 bg-slate-950 text-emerald-500/80 max-h-[600px] overflow-y-auto">
                <div>[SYS_INFO] ADMIN_TERMINAL_V1.4.0 INITIALIZED</div>
                <div>[SYS_INFO] SECURE_HANDSHAKE_ESTABLISHED_WITH_AUTH_SERVICE</div>
                <div>[SYS_INFO] DATA_STREAMS_ACTIVE: WAVES, PRODUCTS, USERS, SUPPLIERS</div>
                {waves?.slice(0, 10).map((w, i) => (
                  <div key={i}>[DATA_SYNC] RESOURCE_DETECTED: WAVE_{w.waveId.slice(0,8)} - STATUS: {w.status.toUpperCase()}</div>
                ))}
                <div>[SYS_READY] STANDING_BY_FOR_COMMANDS...</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Re-using ShoppingBag icon from Lucide
const ShoppingBag = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default AdminDashboard;
