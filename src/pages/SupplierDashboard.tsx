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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">{supplier?.companyName}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center hover:bg-blue-700 transition shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" /> Create New Wave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-blue-600 mb-2">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span className="font-semibold uppercase text-xs tracking-wider">Active Waves</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{myWaves?.filter(w => w.status === 'active').length || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-green-600 mb-2">
            <Package className="h-5 w-5 mr-2" />
            <span className="font-semibold uppercase text-xs tracking-wider">Total Orders</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{myOrders?.length || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-purple-600 mb-2">
            <Truck className="h-5 w-5 mr-2" />
            <span className="font-semibold uppercase text-xs tracking-wider">Pending Shipment</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{myOrders?.filter(o => o.status === 'paid').length || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Waves Management */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Waves</h2>
          <div className="space-y-4">
            {myWaves?.map((wave: any) => (
              <div key={wave.waveId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{wave.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Threshold: {wave.currentParticipants} / {wave.threshold}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(wave.status)}`}>
                    {wave.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
            {myWaves?.length === 0 && <p className="text-gray-500 italic">No waves created yet.</p>}
          </div>
        </section>

        {/* Orders Fulfillment */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fulfillment</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myOrders?.map((order: any) => (
                  <tr key={order.orderId}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        #{order.orderId.slice(-6)}
                        {!order.addressProvided && (
                          <span className="ml-2 text-amber-500" title="Waiting for address">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM dd') : 'Recently'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'paid' && order.addressProvided && (
                        <button
                          onClick={() => markAsShipped(order.orderId)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-bold"
                        >
                          Ship Now
                        </button>
                      )}
                      {order.status === 'paid' && !order.addressProvided && (
                        <span className="text-gray-400 text-sm italic">Waiting for Address</span>
                      )}
                    </td>
                  </tr>
                ))}
                {myOrders?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">No orders to fulfill.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Create Wave Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Wave</h2>
            <form onSubmit={handleCreateWave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price (GBP)</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Participants</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Launch Wave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
