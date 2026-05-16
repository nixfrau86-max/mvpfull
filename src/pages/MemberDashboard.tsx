import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, ExternalLink, Users, AlertCircle, MapPin } from 'lucide-react';

const MemberDashboard = () => {
  const [user] = useAuthState(auth);
  const [showAddressForm, setShowAddressForm] = useState<string | null>(null);
  const [address, setAddress] = useState({ street: '', city: '', postcode: '', country: 'UK' });

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Joined Waves */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications / Actions Needed */}
          {orders?.filter(o => !o.addressProvided).map(order => (
            <div key={order.orderId} className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div className="flex-grow">
                <h3 className="text-amber-800 font-bold">Action Required: Delivery Address</h3>
                <p className="text-amber-700 text-sm mb-3">Your wave for Order #{order.orderId.slice(-6)} has succeeded! Please provide your delivery address to receive your items.</p>
                <button 
                  onClick={() => setShowAddressForm(order.orderId)}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition"
                >
                  Provide Address
                </button>
              </div>
            </div>
          ))}

          <h2 className="text-xl font-semibold flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-600" /> Active participations
          </h2>
          
          {loadingMemberships && <p>Loading your waves...</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedMemberships?.map((membership: any) => (
              <JoinedWaveCard key={membership.id} waveId={membership.waveId} />
            ))}
            
            {joinedMemberships?.length === 0 && (
              <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                You haven't joined any waves yet. 
                <Link to="/" className="text-blue-600 ml-1 font-medium hover:underline">Explore waves</Link>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold flex items-center mt-12">
            <Package className="mr-2 h-5 w-5 text-blue-600" /> Order History
          </h2>

          {loadingOrders && <p>Loading your orders...</p>}

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders?.map((order: any) => (
                  <tr key={order.orderId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderId.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      £{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.addressProvided ? (
                        <span className="flex items-center text-green-600">
                          <MapPin className="h-3 w-3 mr-1" /> Provided
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {orders?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No orders yet. They will appear here once a Wave you joined is successful.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile / Stats */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4">Account Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Total Joined</span>
                <span className="font-bold text-xl">{joinedMemberships?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Successful Orders</span>
                <span className="font-bold text-xl">{orders?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">How it works</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                <span>Join waves that interest you. No charge is made yet.</span>
              </li>
              <li className="flex">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                <span>Once the participant threshold is met, the wave locks.</span>
              </li>
              <li className="flex">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                <span>Your card is charged the final price and the supplier ships your item.</span>
              </li>
            </ul>
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

  if (!wave) return <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-900 truncate pr-2">{wave.productName}</h4>
        <span className={`text-xs px-2 py-1 rounded font-semibold ${
          wave.status === 'active' ? 'bg-blue-100 text-blue-800' :
          wave.status === 'locking' ? 'bg-amber-100 text-amber-800 animate-pulse' :
          wave.status === 'locked' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {wave.status}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Users className="h-3 w-3 mr-1" />
        {wave.currentParticipants} / {wave.threshold} joined
      </div>
      
      <Link 
        to={`/wave/${waveId}`}
        className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-800"
      >
        View status <ExternalLink className="ml-1 h-3 w-3" />
      </Link>
    </div>
  );
};

export default MemberDashboard;
