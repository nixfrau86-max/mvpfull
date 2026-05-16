import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Clock, Users, Shield, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const WaveDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [wave] = useDocumentData(doc(db, 'waves', id || ''));

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, we'd call the backend to create a PaymentIntent
      // and then use Stripe Elements to collect payment info.
      // For this MVP, we'll simulate the call to /joinWave.
      
      const response = await fetch('https://us-central1-collective-savers.cloudfunctions.net/joinWave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waveId: id,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join wave');
      }

      const data = await response.json();
      console.log('Joined wave:', data);
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!wave) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-blue-600 p-8 flex flex-col justify-center text-white">
            <h1 className="text-3xl font-bold mb-4">{wave.productName}</h1>
            <p className="text-blue-100 mb-8">{wave.description}</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-3" />
                <div>
                  <div className="font-bold">{wave.currentParticipants || 0} / {wave.threshold}</div>
                  <div className="text-sm opacity-75">Participants joined</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-6 w-6 mr-3" />
                <div>
                  <div className="font-bold">{formatDistanceToNow(new Date(wave.deadline))} left</div>
                  <div className="text-sm opacity-75">Wave deadline</div>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-3" />
                <div>
                  <div className="font-bold">No Charge Now</div>
                  <div className="text-sm opacity-75">Card only charged if wave fills</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 p-8">
            <div className="mb-8">
              <h2 className="text-gray-500 uppercase tracking-wider text-sm font-semibold mb-1">Current Price</h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">£{wave.basePrice}</span>
                <span className="ml-2 text-green-600 font-semibold flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Save with others
                </span>
              </div>
            </div>

            {wave.discountTiers && wave.discountTiers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Volume Discounts</h3>
                <div className="space-y-2">
                  {wave.discountTiers.map((tier: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{tier.participants}+ participants</span>
                      <span className="font-bold text-blue-600">£{tier.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            <button
              onClick={handleJoin}
              disabled={loading || wave.status !== 'active'}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 active:scale-95 ${
                wave.status === 'active' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : wave.status === 'locking'
                  ? 'bg-amber-500 text-white cursor-not-allowed'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              {loading ? 'Joining...' : wave.status === 'active' ? 'Join Wave' : wave.status === 'locking' ? 'Locking...' : 'Wave Closed'}
            </button>
            
            <p className="mt-4 text-center text-xs text-gray-500">
              By joining, you authorize a hold on your card for £{wave.basePrice}. 
              Payment is only captured if the threshold of {wave.threshold} is reached.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveDetail;
