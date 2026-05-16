import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LandingPage = () => {
  const wavesQuery = query(collection(db, 'waves'), where('status', '==', 'active'));
  const [waves, loading, error] = useCollectionData(wavesQuery);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Buy together, save together.
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            No subscription. Just collective power for better prices.
          </p>
          <Link 
            to="/login" 
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Waves List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Active Waves</h2>
        
        {loading && <div className="text-center py-10">Loading waves...</div>}
        {error && <div className="text-center py-10 text-red-600">Error loading waves.</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {waves?.map((wave: any) => (
            <div key={wave.waveId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{wave.productName}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{wave.description}</p>
                
                <div className="flex items-center text-gray-700 mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="font-medium">{wave.currentParticipants || 0} / {wave.threshold} participants</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(((wave.currentParticipants || 0) / wave.threshold) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center text-gray-700 mb-6">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Ends in {formatDistanceToNow(new Date(wave.deadline))}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-2xl font-bold text-blue-600">£{wave.basePrice}</div>
                  <Link 
                    to={`/wave/${wave.waveId}`}
                    className="flex items-center text-blue-600 font-semibold hover:text-blue-800"
                  >
                    View Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {waves?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No active waves at the moment. Check back later!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
