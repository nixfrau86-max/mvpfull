import { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, Lock, XCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const wavesQuery = query(collection(db, 'waves'), orderBy('createdAt', 'desc'));
  const [waves, loading] = useCollectionData(wavesQuery);

  const handleForceAction = async (waveId: string, action: 'forceLock' | 'forceFail') => {
    setProcessing(waveId);
    setMessage(null);
    try {
      // In a real app, we would include the admin bearer token here
      const response = await fetch(`https://us-central1-collective-savers.cloudfunctions.net/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${await user?.getIdToken()}`
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

  if (loading) return <div className="text-center py-20">Loading admin console...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 text-red-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wave / Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {waves?.map((wave: any) => (
              <tr key={wave.waveId}>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{wave.productName}</div>
                  <div className="text-xs text-gray-500">ID: {wave.waveId}</div>
                  <div className="text-xs text-gray-400">{wave.createdAt?.seconds ? format(new Date(wave.createdAt.seconds * 1000), 'MMM dd, HH:mm') : 'Recently'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    wave.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                    wave.status === 'locking' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    wave.status === 'locked' ? 'bg-green-100 text-green-800' : 
                    wave.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {wave.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {wave.currentParticipants} / {wave.threshold}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {wave.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleForceAction(wave.waveId, 'forceLock')}
                        disabled={!!processing}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing === wave.waveId ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        Force Lock
                      </button>
                      <button
                        onClick={() => handleForceAction(wave.waveId, 'forceFail')}
                        disabled={!!processing}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        {processing === wave.waveId ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        Force Fail
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
