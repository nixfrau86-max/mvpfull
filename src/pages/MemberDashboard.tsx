import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, getDoc, updateDoc, limit, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, ExternalLink, Users, AlertCircle } from 'lucide-react';

const MemberDashboard = () => {
  const [user] = useAuthState(auth);
  const [showAddressForm, setShowAddressForm] = useState<string | null>(null);
  const [address, setAddress] = useState({ street: '', city: '', postcode: '', country: 'UK' });

  // Query waves user has joined - Limit to recent 10 for performance
  const joinedWavesQuery = user ? query(
    collection(db, 'waveMembers'), 
    where('userId', '==', user.uid),
    orderBy('joinedAt', 'desc'),
    limit(10)
  ) : null;
  const [joinedMemberships, loadingMemberships] = useCollectionData(joinedWavesQuery);

  // Query orders for user - Limit to recent 5 for performance
  const ordersQuery = user ? query(
    collection(db, 'orders'), 
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(5)
  ) : null;
  const [orders, loadingOrders] = useCollectionData(ordersQuery);

  const handleSubmitAddress = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryAddress: address,
        addressProvided: true
      });
      setShowAddressForm(null);
      setAddress({ street: '', city: '', postcode: '', country: 'UK' });
    } catch (err) {
      console.error('Error updating address:', err);
    }
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Member Dashboard©</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your active Wave© participations and order history.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Notifications / Actions Needed */}
            {orders?.filter(o => !o.addressProvided).map(order => (
              <div key={order.orderId} className="bg-white border border-amber-200 p-6 rounded-[2rem] shadow-xl shadow-amber-500/5 flex items-start relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
                <div className="bg-amber-100 p-3 rounded-2xl mr-5">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-slate-900 font-extrabold text-lg">Shipping Address Required</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-5 leading-relaxed">
                    Great news! Your Wave© for <strong>Order #{order.orderId.slice(-6)}</strong> has succeeded. We need your delivery address to finalize the shipment.
                  </p>
                  <button 
                    onClick={() => setShowAddressForm(order.orderId)}
                    className="bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    Set Delivery Address
                  </button>
                </div>
              </div>
            ))}

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Clock className="mr-3 h-6 w-6 text-indigo-600" /> Active Participations©
                </h2>
                <div className="h-px flex-grow bg-slate-100 ml-6"></div>
              </div>
              
              {loadingMemberships && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-3xl"></div>)}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {joinedMemberships?.map((membership: any) => (
                  <JoinedWaveCard key={membership.id} waveId={membership.waveId} />
                ))}
                
                {joinedMemberships?.length === 0 && !loadingMemberships && (
                  <div className="col-span-full bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No active Waves© joined</h3>
                    <p className="text-slate-500 mt-2 mb-6">Ready to start saving? Discover collective buying opportunities.</p>
                    <Link to="/" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700">
                      Explore Waves© <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Package className="mr-3 h-6 w-6 text-indigo-600" /> Order History
                </h2>
                <div className="h-px flex-grow bg-slate-100 ml-6"></div>
              </div>

              {loadingOrders && <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>}

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Reference</th>
                        <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                        <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders?.map((order: any) => (
                        <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-slate-900">
                            #{order.orderId.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-black rounded-full uppercase tracking-tighter ${
                              order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 
                              order.status === 'shipped' ? 'bg-sky-50 text-sky-700' : 
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-slate-900">
                            £{order.totalAmount}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500">
                            {order.addressProvided ? (
                              <span className="flex items-center text-emerald-600 font-bold text-xs uppercase">
                                <CheckCircle className="h-3.5 w-3.5 mr-2" /> Address Ready
                              </span>
                            ) : (
                              <button 
                                onClick={() => setShowAddressForm(order.orderId)}
                                className="text-amber-600 font-bold text-xs uppercase hover:underline"
                              >
                                Action Needed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      
                      {orders?.length === 0 && !loadingOrders && (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium">
                            Your successful Wave© orders will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
              <h3 className="text-xl font-bold mb-8 relative">Account Insight</h3>
              <div className="space-y-6 relative">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-white/70 font-medium">Participations©</span>
                  <span className="font-black text-2xl">{joinedMemberships?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 font-medium">Successful Waves©</span>
                  <span className="font-black text-2xl">{orders?.length || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-8">The Process©</h3>
              <ul className="space-y-8">
                <li className="flex group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-4 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">Reserve</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">Join a Wave©. Your card is pre-authorized but no funds are moved yet.</p>
                  </div>
                </li>
                <li className="flex group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-4 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">Lock</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">Threshold reached! The Wave© locks and we process payments at the final bulk price.</p>
                  </div>
                </li>
                <li className="flex group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-4 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">Fulfill</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">The supplier prepares your shipment. You'll receive tracking details immediately.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>
            <form onSubmit={(e) => handleSubmitAddress(e, showAddressForm)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postcode</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={address.postcode}
                    onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(null)}
                  className="px-4 py-2 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component to fetch wave details for a joined wave
const JoinedWaveCard = ({ waveId }: { waveId: string }) => {
  const [wave, setWave] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchWave = async () => {
      const waveDoc = await getDoc(doc(db, 'waves', waveId));
      if (waveDoc.exists()) {
        setWave(waveDoc.data());
      }
    };
    fetchWave();
  }, [waveId]);

  if (!wave) return <div className="h-40 bg-slate-50 animate-pulse rounded-[2rem]"></div>;

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <h4 className="font-bold text-slate-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">{wave.productName}</h4>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
          wave.status === 'active' ? 'bg-indigo-50 text-indigo-700' :
          wave.status === 'locking' ? 'bg-amber-50 text-amber-700 animate-pulse' :
          wave.status === 'locked' ? 'bg-emerald-50 text-emerald-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {wave.status}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-500 font-medium">
            <Users className="h-3.5 w-3.5 mr-2 text-indigo-500" />
            <span className="text-slate-900 font-bold mr-1">{wave.currentParticipants}</span>
            <span className="text-slate-400">/ {wave.threshold}</span>
          </div>
          <div className="text-indigo-600 font-bold text-xs">
            {Math.round((wave.currentParticipants / wave.threshold) * 100)}% Full
          </div>
        </div>
        
        <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-50">
        <Link 
          to={`/wave/${waveId}`}
          className="flex items-center justify-center text-indigo-600 text-xs font-black uppercase tracking-widest hover:text-indigo-700 transition-colors"
        >
          View Live Status© <ExternalLink className="ml-2 h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default MemberDashboard;
