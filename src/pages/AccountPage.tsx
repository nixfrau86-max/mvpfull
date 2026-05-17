import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Mail, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const AccountPage = () => {
  const [user] = useAuthState(auth);
  const [userData] = useDocumentData(user ? doc(db, 'users', user.uid) : null);

  if (!user) return null;

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Account©</h1>
          <p className="text-slate-500 mt-2 font-medium">Personal information and security settings.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <User size={48} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{userData?.name || 'Savers Member'}</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Verified Member©</p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <ShieldCheck size={16} className="mr-2" /> Identity Secured
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-8">Personal Information</h3>
              
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Full Legal Name</p>
                    <p className="font-bold text-slate-900">{userData?.name || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                    <p className="font-bold text-slate-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Member Since</p>
                    <p className="font-bold text-slate-900">
                      {userData?.createdAt ? format(new Date(userData.createdAt), 'MMMM dd, yyyy') : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Region</p>
                    <p className="font-bold text-slate-900">United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-8">
              <h4 className="text-indigo-900 font-bold text-sm mb-2">Privacy & Transparency©</h4>
              <p className="text-indigo-700/70 text-xs leading-relaxed">
                Your data is never sold. We only share your shipping address with the supplier once a Wave™ successfully locks and your payment is processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
