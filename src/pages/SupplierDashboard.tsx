import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Plus, Package, TrendingUp, Truck, AlertCircle } from 'lucide-react';
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
            companyName: user.displayName || 'Demo Company',
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
    const trackingNumber = prompt('Enter tracking number:');
    if (!trackingNumber) return;

    try {
      // Call backend API
      const response = await fetch('https://us-central1-collective-savers.cloudfunctions.net/markOrderShipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingNumber })
      });

      if (!response.ok) throw new Error('Failed to mark as shipped');
      alert('Order marked as shipped!');
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'locking': return 'bg-amber-100 text-amber-800 animate-pulse';
      case 'locked': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20">Loading supplier portal...</div>;

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Supplier Portal©</h1>
            <p className="text-slate-500 mt-2 font-semibold flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              {supplier?.companyName}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold flex items-center hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" /> Launch New Wave©
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-16 w-16 text-indigo-600" />
            </div>
            <div className="flex items-center text-indigo-600 mb-4">
              <TrendingUp className="h-5 w-5 mr-2" />
              <span className="font-black uppercase text-[10px] tracking-widest">Active Waves©</span>
            </div>
            <div className="text-4xl font-black text-slate-900">
              {myWaves?.filter(w => w.status === 'active').length || 0}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Package className="h-16 w-16 text-emerald-600" />
            </div>
            <div className="flex items-center text-emerald-600 mb-4">
              <Package className="h-5 w-5 mr-2" />
              <span className="font-black uppercase text-[10px] tracking-widest">Total Orders</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{myOrders?.length || 0}</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Truck className="h-16 w-16 text-sky-600" />
            </div>
            <div className="flex items-center text-sky-600 mb-4">
              <Truck className="h-5 w-5 mr-2" />
              <span className="font-black uppercase text-[10px] tracking-widest">Pending Fulfillment</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{myOrders?.filter(o => o.status === 'paid').length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Waves Management */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">My Live Waves©</h2>
              <div className="h-px flex-grow bg-slate-100 ml-6"></div>
            </div>
            <div className="space-y-6">
              {myWaves?.map((wave: any) => (
                <div key={wave.waveId} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                      <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{wave.productName}</h3>
                      <div className="flex items-center text-slate-400 text-sm font-medium">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-slate-900 font-bold mr-1">{wave.currentParticipants}</span>
                        <span>/ {wave.threshold} Participants joined</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(wave.status)}`}>
                      {wave.status}
                    </span>
                  </div>
                  <div className="mt-6 w-full bg-slate-50 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {myWaves?.length === 0 && (
                <div className="py-20 text-center rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200">
                  <Plus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No active Waves© yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Orders Fulfillment */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Order Fulfillment</h2>
              <div className="h-px flex-grow bg-slate-100 ml-6"></div>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myOrders?.map((order: any) => (
                      <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-900 flex items-center">
                            #{order.orderId.slice(-6).toUpperCase()}
                            {!order.addressProvided && (
                              <div className="ml-3 group relative">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Waiting for customer address
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                            {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd, yyyy') : 'Recently'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {order.status === 'paid' && order.addressProvided ? (
                            <button
                              onClick={() => markAsShipped(order.orderId)}
                              className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              Dispatch
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                              {order.status === 'shipped' ? 'Completed' : 'Pending Address'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {myOrders?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-slate-400 text-sm font-medium italic">
                          Successful Wave© orders will appear here for fulfillment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Create Wave Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
            <div className="bg-white rounded-[3rem] max-w-xl w-full p-12 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Launch Wave©</h2>
              <form onSubmit={handleCreateWave} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="e.g. 205/55 R16 Tyres"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                    placeholder="Describe the product and the bulk deal..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (GBP)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                      <input
                        type="number"
                        required
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-8 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Threshold</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                      placeholder="Min participants"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wave Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 transition-all"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end space-x-6 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                  >
                    Launch Now©
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
