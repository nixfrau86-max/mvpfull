import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Mail, Calendar, ShieldCheck, MapPin, Building, Hash, FileText, UserCircle, Edit3, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

const AccountPage = () => {
  const [user] = useAuthState(auth);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData] = useDocumentData(user && !isSupplier ? doc(db, 'users', user.uid) : null);
  const [supplierData] = useDocumentData(user ? doc(db, 'suppliers', user.uid) : null);

  // Form states for supplier editing
  const [editForm, setEditForm] = useState({
    companyName: '',
    companyNumber: '',
    taxId: '',
    representativeName: ''
  });

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const supplierDoc = await getDoc(doc(db, 'suppliers', user.uid));
        const exists = supplierDoc.exists();
        setIsSupplier(exists);
        if (exists) {
          const data = supplierDoc.data();
          setEditForm({
            companyName: data.companyName || '',
            companyNumber: data.companyNumber || '',
            taxId: data.taxId || '',
            representativeName: data.representativeName || ''
          });
        }
      }
    };
    checkRole();
  }, [user]);

  const handleSaveSupplierDetails = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'suppliers', user.uid), {
        ...editForm,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating supplier details:", err);
      alert("Failed to save changes.");
    }
  };

  if (!user) return null;

  const displayName = isSupplier ? supplierData?.companyName : (userData?.name || 'Savers Member');

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {isSupplier ? 'Supplier Profile™' : 'Your Account™'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isSupplier ? 'Corporate transparency and accountability records.' : 'Personal information and security settings.'}
            </p>
          </div>
          {isSupplier && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <Edit3 size={16} />
              <span>Edit Details</span>
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center sticky top-32">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                {isSupplier ? <Building size={48} /> : <User size={48} />}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                {isSupplier ? 'Verified Distributor™' : 'Verified Member™'}
              </p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <ShieldCheck size={16} className="mr-2" /> 
                {isSupplier ? 'Regulatory Clear™' : 'Identity Secured'}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-8">
                {isSupplier ? 'Accountability Data™' : 'Personal Information'}
              </h3>
              
              {isSupplier && isEditing ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Official Company Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Company Registration Number</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold"
                        placeholder="e.g. 12345678"
                        value={editForm.companyNumber}
                        onChange={(e) => setEditForm({...editForm, companyNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Tax ID / VAT Number</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold"
                        placeholder="e.g. GB 123 4567 89"
                        value={editForm.taxId}
                        onChange={(e) => setEditForm({...editForm, taxId: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Authorised Representative</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold"
                        placeholder="Full Legal Name"
                        value={editForm.representativeName}
                        onChange={(e) => setEditForm({...editForm, representativeName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <button 
                      onClick={handleSaveSupplierDetails}
                      className="flex-grow flex items-center justify-center space-x-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                      <Save size={18} />
                      <span>Sync Account™</span>
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {isSupplier ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Company Name</p>
                          <p className="font-bold text-slate-900">{supplierData?.companyName || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                          <Hash size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Company Number</p>
                          <p className="font-bold text-slate-900">{supplierData?.companyNumber || 'PENDING_REG'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tax Identification</p>
                          <p className="font-bold text-slate-900">{supplierData?.taxId || 'PENDING_TAX_ID'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Authorised Representative</p>
                          <p className="font-bold text-slate-900">{supplierData?.representativeName || 'Not designated'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Operational Region</p>
                      <p className="font-bold text-slate-900">United Kingdom</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-8">
              <h4 className="text-indigo-900 font-bold text-sm mb-2">Transparency & Accountability™</h4>
              <p className="text-indigo-700/70 text-xs leading-relaxed">
                {isSupplier 
                  ? "As a registered distributor, your accountability data ensures member trust. All legal records are encrypted and only accessible for audit purposes."
                  : "Your data is never sold. We only share your shipping address with the supplier once a Wave™ successfully locks and your payment is processed."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
