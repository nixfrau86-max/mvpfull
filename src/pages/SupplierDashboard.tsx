import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Plus, Package, TrendingUp, Truck, AlertCircle, Zap, Shield, Users } from 'lucide-react';
import { format } from 'date-fns';

const SupplierDashboard = () => {
  const [user] = useAuthState(auth);
  const [supplier, setSupplier] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [threshold, setThreshold] = useState('');
  const [deadline, setDeadline] = useState('');

  // Queries
  const wavesQuery = user ? query(collection(db, 'waves'), where('supplierId', '==', user.uid)) : null;
  const [myWaves] = useCollectionData(wavesQuery);

  const ordersQuery = user ? query(collection(db, 'orders'), where('supplierId', '==', user.uid)) : null;
  const [myOrders] = useCollectionData(ordersQuery);

  useEffect(() => {
    const checkSupplier = async () => {
      if (user) {
        const docRef = doc(db, 'suppliers', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSupplier(docSnap.data());
        } else {
          // Auto-register as supplier for MVP demo
          const newSupplier = {
            supplierId: user.uid,
            companyName: user.displayName || 'Industrial Nexus™',
            email: user.email,
            stripeConnectAccountId: 'acct_mock_123',
            performanceBondPaid: true,
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newSupplier);
          setSupplier(newSupplier);
        }
      }
      setLoading(false);
    };
    checkSupplier();
  }, [user]);

  const handleCreateWave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const waveData = {
        supplierId: user.uid,
        productName,
        description,
        basePrice: parseFloat(basePrice),
        threshold: parseInt(threshold),
        deadline: new Date(deadline).toISOString(),
        status: 'active',
        currentParticipants: 0,
        createdAt: new Date().toISOString(),
        discountTiers: []
      };

      const docRef = await addDoc(collection(db, 'waves'), waveData);
      // Update with ID
      await setDoc(doc(db, 'waves', docRef.id), { ...waveData, waveId: docRef.id });
      
      setShowCreateForm(false);
      // Reset form
      setProductName('');
      setDescription('');
      setBasePrice('');
      setThreshold('');
      setDeadline('');
    } catch (err) {
      console.error('Error creating wave:', err);
    }
  };

  const markAsShipped = async (orderId: string) => {
    const trackingNumber = prompt('Enter protocol tracking number:');
    if (!trackingNumber) return;

    try {
      const response = await fetch('https://us-central1-collective-savers.cloudfunctions.net/markOrderShipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingNumber })
      });

      if (!response.ok) throw new Error('Failed to mark as shipped');
      alert('Order status: DISPATCHED');
    } catch (err) {
      console.error(err);
      alert('Error updating protocol');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'locking': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'locked': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-slate-400 border-white/10';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Supply Chain...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0b0c10] min-h-screen pb-20 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 text-sky-500 mb-3">
              <div className="p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                <Shield className="h-4 w-4 fill-current" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Supply Authorization</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Supplier Hub™</h1>
            <p className="text-slate-500 mt-4 font-bold text-lg uppercase tracking-widest">{supplier?.companyName}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="group relative bg-white text-slate-950 px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-indigo-600 hover:text-white shadow-xl active:scale-95 flex items-center"
          >
            <Plus className="h-4 w-4 mr-3" /> 
            <span>Initialize New Wave™</span>
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          <div className="bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="h-24 w-24 text-indigo-500" />
            </div>
            <div className="flex items-center text-indigo-400 mb-6">
              <TrendingUp className="h-5 w-5 mr-3" />
              <span className="font-black uppercase text-[9px] tracking-[0.3em]">Live Transmissions™</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter">
              {myWaves?.filter(w => w.status === 'active').length || 0}
            </div>
          </div>

          <div className="bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Package className="h-24 w-24 text-emerald-500" />
            </div>
            <div className="flex items-center text-emerald-400 mb-6">
              <Package className="h-5 w-5 mr-3" />
              <span className="font-black uppercase text-[9px] tracking-[0.3em]">Cumulative Orders</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter">{myOrders?.length || 0}</div>
          </div>

          <div className="bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Truck className="h-24 w-24 text-sky-500" />
            </div>
            <div className="flex items-center text-sky-400 mb-6">
              <Truck className="h-5 w-5 mr-3" />
              <span className="font-black uppercase text-[9px] tracking-[0.3em]">Pending Logistics</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter">{myOrders?.filter(o => o.status === 'paid').length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Waves Management */}
          <section>
            <div className="flex items-center space-x-6 mb-12">
              <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase opacity-40">Managed Wavefronts™</h2>
              <div className="h-px flex-grow bg-white/10"></div>
            </div>
            <div className="space-y-8">
              {myWaves?.map((wave: any) => (
                <div key={wave.waveId} className="bg-white/[0.03] p-10 rounded-[3.5rem] border border-white/[0.05] hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex-grow pr-6">
                      <h3 className="font-black text-2xl text-white group-hover:text-indigo-400 transition-colors mb-2 uppercase tracking-tight">{wave.productName}</h3>
                      <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <Users className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                        <span>Nodes Sync:</span>
                        <span className="text-white ml-2">{wave.currentParticipants} / {wave.threshold}</span>
                      </div>
                    </div>
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusColor(wave.status)}`}>
                      {wave.status}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                      style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {myWaves?.length === 0 && (
                <div className="py-24 text-center rounded-[4rem] bg-white/[0.01] border border-white/5 border-dashed">
                  <Zap className="h-12 w-12 text-slate-800 mx-auto mb-6" />
                  <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">No active supply protocols</p>
                </div>
              )}
            </div>
          </section>

          {/* Orders Fulfillment */}
          <section>
            <div className="flex items-center space-x-6 mb-12">
              <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase opacity-40">Asset Distribution</h2>
              <div className="h-px flex-grow bg-white/10"></div>
            </div>
            <div className="bg-white/[0.02] rounded-[3.5rem] border border-white/[0.05] overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="px-10 py-8 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Ref</th>
                      <th className="px-10 py-8 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Status</th>
                      <th className="px-10 py-8 text-right text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {myOrders?.map((order: any) => (
                      <tr key={order.orderId} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-10 py-10">
                          <div className="text-sm font-black text-white flex items-center tracking-widest uppercase">
                            #{order.orderId.slice(-10).toUpperCase()}
                            {!order.addressProvided && (
                              <div className="ml-4 group relative">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-2xl">
                                  Awaiting Target Coordinates
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-[9px] font-black text-slate-600 mt-2 uppercase tracking-widest">
                            {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd, yyyy') : 'SECURED RECENTLY'}
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                            order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-10 text-right">
                          {order.status === 'paid' && order.addressProvided ? (
                            <button
                              onClick={() => markAsShipped(order.orderId)}
                              className="bg-white text-slate-950 px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                              Finalize Logistics
                            </button>
                          ) : (
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
                              {order.status === 'shipped' ? 'COMPLETED' : 'AWAITING DATA'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Create Wave Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] max-w-2xl w-full p-16 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-sky-600"></div>
              <h2 className="text-4xl font-black text-white mb-12 tracking-tighter uppercase leading-none">Initialize Wave™</h2>
              <form onSubmit={handleCreateWave} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-6">Product Designation</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                    placeholder="e.g. CORE-TECH UNIT 01"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-6">Technical Specification</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none resize-none"
                    placeholder="Detailed operational parameters..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-6">Acquisition Value (GBP)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-black">£</span>
                      <input
                        type="number"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 pl-12 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-6">Target Equilibrium</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                      placeholder="Nodes"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-6">Temporal Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-white font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none [color-scheme:dark]"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end space-x-10 pt-10">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="bg-white text-slate-950 px-14 py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95"
                  >
                    Launch System™
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;
