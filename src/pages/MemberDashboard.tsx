import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ExternalLink, Users, AlertCircle, Zap, Shield } from 'lucide-react';
import WaveProgressVisualizer from '../components/WaveProgressVisualizer';

const MemberDashboard = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState<string | null>(null);
  const [address, setAddress] = useState({ street: '', city: '', postcode: '', country: 'UK' });

  useEffect(() => {
    const checkSupplierEject = async () => {
      if (user) {
        const supplierDoc = await getDoc(doc(db, 'suppliers', user.uid));
        if (supplierDoc.exists()) {
          navigate('/supplier');
        }
      }
    };
    checkSupplierEject();
  }, [user, navigate]);

  // Query waves user has joined
  const joinedWavesQuery = user ? query(collection(db, 'waveMembers'), where('userId', '==', user.uid)) : null;
  const [joinedMemberships, loadingMemberships] = useCollectionData(joinedWavesQuery);

  // Query orders for user
  const ordersQuery = user ? query(collection(db, 'orders'), where('userId', '==', user.uid)) : null;
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
    <div className="bg-[#0b0c10] min-h-screen pb-20 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-500 mb-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Interface</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Member Console™</h1>
            <p className="text-slate-500 mt-4 font-medium text-lg">Managing active collective power protocols.</p>
          </div>
          <div className="text-right">
            <div className="inline-block p-6 bg-white/[0.03] border border-white/[0.05] rounded-[2rem] backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 text-left">Identity Verified</div>
              <div className="text-sm font-bold text-white text-left flex items-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_#10b981]"></div>
                {user?.email}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Notifications / Actions Needed */}
            {orders?.filter(o => !o.addressProvided).map(order => (
              <div key={order.orderId} className="relative group overflow-hidden bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 p-10 rounded-[3rem] backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-amber-500/20 transition-all duration-1000"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="bg-amber-500/20 p-5 rounded-3xl mr-8 border border-amber-500/30 mb-6 md:mb-0 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-white font-black text-2xl mb-2 tracking-tight">Fulfillment Credentials Required</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-md">
                      Protocol successful for <strong>Order #{order.orderId.slice(-8).toUpperCase()}</strong>. Finalize destination coordinates to initiate physical delivery.
                    </p>
                    <button 
                      onClick={() => setShowAddressForm(order.orderId)}
                      className="bg-amber-500 text-black px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_40px_rgba(245,158,11,0.2)] active:scale-95"
                    >
                      Input Coordinates
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <section>
              <div className="flex items-center space-x-6 mb-10">
                <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase opacity-40">Active Transmissions™</h2>
                <div className="h-px flex-grow bg-white/10"></div>
              </div>
              
              {loadingMemberships && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[1, 2].map(i => <div key={i} className="h-80 bg-white/[0.02] animate-pulse rounded-[3rem] border border-white/[0.05]"></div>)}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {joinedMemberships?.map((membership: any) => (
                  <JoinedWaveCard key={membership.id} waveId={membership.waveId} />
                ))}
                
                {joinedMemberships?.length === 0 && !loadingMemberships && (
                  <div className="col-span-full bg-white/[0.02] p-20 rounded-[4rem] border border-white/[0.05] border-dashed text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-700 border border-white/5 shadow-inner">
                      <Zap className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">No Active Protocols Found</h3>
                    <p className="text-slate-500 mb-10 max-w-xs mx-auto font-medium">Your current collective capacity is idle. Scan the marketplace to engage.</p>
                    <Link to="/marketplace" className="inline-flex items-center px-10 py-5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/40">
                      Explore Market™ <ExternalLink className="ml-3 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-6 mb-10">
                <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase opacity-40">Protocol Archive</h2>
                <div className="h-px flex-grow bg-white/10"></div>
              </div>

              {loadingOrders && <div className="h-64 bg-white/[0.02] animate-pulse rounded-[3rem] border border-white/[0.05]"></div>}

              <div className="bg-white/[0.02] rounded-[3rem] border border-white/[0.05] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Hash / UID</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Status Protocol</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Capital Value</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Destination</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {orders?.map((order: any) => (
                        <tr key={order.orderId} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-10 whitespace-nowrap">
                            <div className="text-sm font-black text-white tracking-widest uppercase">
                              #{order.orderId.slice(-10).toUpperCase()}
                            </div>
                            <div className="text-[9px] font-bold text-slate-600 mt-1">ISSUED: {new Date().toLocaleDateString()}</div>
                          </td>
                          <td className="px-10 py-10 whitespace-nowrap">
                            <span className={`px-5 py-2 inline-flex text-[9px] font-black rounded-full uppercase tracking-[0.2em] border ${
                              order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              order.status === 'shipped' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 
                              'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-10 py-10 whitespace-nowrap">
                            <div className="text-lg font-black text-white">£{order.totalAmount}</div>
                            <div className="text-[9px] font-bold text-slate-600">GBP NET</div>
                          </td>
                          <td className="px-10 py-10 whitespace-nowrap">
                            {order.addressProvided ? (
                              <div className="flex items-center text-emerald-500/80 font-black text-[10px] uppercase tracking-widest">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_6px_#10b981]"></div>
                                Encrypted Location
                              </div>
                            ) : (
                              <button 
                                onClick={() => setShowAddressForm(order.orderId)}
                                className="text-amber-500 font-black text-[10px] uppercase tracking-widest hover:text-amber-400 underline underline-offset-8"
                              >
                                Input Destination
                              </button>
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

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-indigo-950/40">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <h3 className="text-xl font-black mb-12 relative uppercase tracking-widest">Operational Intel™</h3>
              
              <div className="space-y-10 relative">
                <div className="flex justify-between items-end border-b border-white/10 pb-8">
                  <div className="flex flex-col">
                    <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Protocols Joined</span>
                    <span className="font-black text-5xl leading-none tracking-tighter">{joinedMemberships?.length || 0}</span>
                  </div>
                  <Zap className="h-8 w-8 text-white/20" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Successful Locks</span>
                    <span className="font-black text-5xl leading-none tracking-tighter">{orders?.length || 0}</span>
                  </div>
                  <CheckCircle className="h-8 w-8 text-white/20" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/[0.03] rounded-[3.5rem] p-12 border border-white/[0.05] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="h-32 w-32" />
              </div>
              <h3 className="text-xl font-black text-white mb-10 uppercase tracking-widest">The Directive™</h3>
              <div className="space-y-12">
                <div className="flex space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-500 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">01</div>
                  <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-3">Initiation</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Join a Wave™ protocol. Your liquidity is pre-authorized via encrypted channels.</p>
                  </div>
                </div>
                <div className="flex space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-sky-600/10 border border-sky-600/20 flex items-center justify-center text-sky-500 font-black text-sm group-hover:bg-sky-600 group-hover:text-white transition-all">02</div>
                  <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-3">Equilibrium</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">When threshold equilibrium is achieved, the collective price is finalized.</p>
                  </div>
                </div>
                <div className="flex space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-500 font-black text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">03</div>
                  <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-3">Manifest</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Asset distribution initiates. Real-time tracking telemetry will be broadcast.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-xl w-full p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Fulfillment Destination</h2>
            <p className="text-slate-500 text-sm mb-10 font-medium tracking-tight uppercase">Order Hash #{showAddressForm.slice(-12).toUpperCase()}</p>
            
            <form onSubmit={(e) => handleSubmitAddress(e, showAddressForm)} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-4">Street / Building Address</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-4">City / Sector</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-4">Postcode / ZIP</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    value={address.postcode}
                    onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-8 pt-8">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(null)}
                  className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                >
                  Confirm Destination
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

  if (!wave) return <div className="h-80 bg-white/[0.02] animate-pulse rounded-[3.5rem] border border-white/[0.05]"></div>;

  return (
    <div className="group relative bg-white/[0.03] p-10 rounded-[3.5rem] border border-white/[0.05] hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
      {/* Background dynamic glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${
        wave.status === 'active' ? 'bg-indigo-500' :
        wave.status === 'locking' ? 'bg-amber-500' :
        wave.status === 'locked' ? 'bg-emerald-500' : 'bg-slate-500'
      }`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Protocol Identification</span>
            <h4 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">{wave.productName}</h4>
          </div>
          <div className={`px-4 py-1.5 rounded-full border ${
            wave.status === 'active' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
            wave.status === 'locking' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
            wave.status === 'locked' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            'bg-white/5 text-slate-500 border-white/10'
          } text-[9px] font-black uppercase tracking-[0.2em]`}>
            {wave.status}
          </div>
        </div>
        
        <WaveProgressVisualizer current={wave.currentParticipants} target={wave.threshold} status={wave.status} />
        
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-6 rounded-full border-2 border-[#0b0c10] bg-slate-800 flex items-center justify-center">
                  <Users className="h-3 w-3 text-slate-500" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{wave.currentParticipants} Active Nodes</span>
          </div>
          
          <Link 
            to={`/wave/${wave.waveId}`}
            className="flex items-center text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300 transition-colors group/link"
          >
            Manage Protocol™ <ExternalLink className="ml-2 h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
