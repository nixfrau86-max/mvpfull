import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, FileText, Scale, ChevronLeft } from 'lucide-react';

const LegalPage = () => {
  const { type } = useParams<{ type: string }>();

  const getContent = () => {
    switch (type) {
      case 'member-terms':
        return {
          title: 'Member Terms & Conditions',
          subtitle: 'Protocol for Collective Buying Participations™',
          icon: <FileText className="text-indigo-600" size={32} />,
          lastUpdated: 'May 17, 2026',
          sections: [
            {
              title: '1. The Collective Wave™ Protocol',
              content: 'By joining a Wave™, you are issuing a pre-authorization for the specified asset price. This is not an immediate charge. Funds are only captured if and when the collective threshold is successfully reached before the deadline.'
            },
            {
              title: '2. Blind Mediator Guarantee',
              content: 'The Collective Savers™ acts as a blind mediator. Your personal identity and payment details are shielded from distributors until a Wave™ is secured. We do not sell or trade member data.'
            },
            {
              title: '3. Commitment & Cancellation',
              content: 'Once you commit to a Wave™, your pre-authorization remains active until the deadline. If the Wave™ fails to meet its threshold, the authorization is automatically voided at zero cost to you.'
            }
          ]
        };
      case 'supplier-terms':
        return {
          title: 'Supplier Terms & Conditions',
          subtitle: 'Distribution Accountability & Fulfillment Protocol',
          icon: <Scale className="text-indigo-600" size={32} />,
          lastUpdated: 'May 17, 2026',
          sections: [
            {
              title: '1. Asset Integrity',
              content: 'Suppliers must guarantee the authenticity and quality of all assets listed via Wave™ templates. Inaccurate descriptions or counterfeit goods result in permanent terminal exclusion and performance bond forfeiture.'
            },
            {
              title: '2. Fulfillment Latency',
              content: 'Once a Wave™ is secured and funds are captured, suppliers must initiate shipment within 48 business hours. Tracking protocol must be updated immediately via the Supplier Portal™.'
            },
            {
              title: '3. Commission Structure',
              content: 'Platform commission is embedded in the member price. Suppliers receive the full bulk price agreed upon in the template negotiation, minus standard Stripe processing fees.'
            }
          ]
        };
      case 'privacy':
      default:
        return {
          title: 'Privacy Policy',
          subtitle: 'Data Encryption & Identity Shielding Protocol',
          icon: <Shield className="text-indigo-600" size={32} />,
          lastUpdated: 'May 17, 2026',
          sections: [
            {
              title: '1. Zero-Contact Policy',
              content: 'Our core protocol ensures that no direct contact occurs between members and suppliers. Data exchange is limited strictly to the minimum required for fulfillment (name and shipping address) only after successful payment.'
            },
            {
              title: '2. Technical Security',
              content: 'All payment data is handled via Stripe Secured handshakes. No raw credit card information ever touches our servers. Firestore encryption handles all identity records.'
            }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      {/* Cinematic Header */}
      <div className="bg-slate-900 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link to="/" className="inline-flex items-center text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8 hover:text-indigo-300 transition-colors">
            <ChevronLeft size={14} className="mr-2" /> Return to Terminal
          </Link>
          <div className="flex items-center space-x-6 mb-6">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
              <div className="text-indigo-400">
                {React.isValidElement(content.icon) ? content.icon : null}
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight italic uppercase">{content.title}</h1>
              <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">{content.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10 md:p-16">
          <div className="flex justify-between items-center mb-12 pb-8 border-b border-slate-50">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document: LEGAL_PROTOCOL_SECURED</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rev: {content.lastUpdated}</div>
          </div>

          <div className="space-y-12">
            {content.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{section.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-slate-50">
            <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100/50">
              <h4 className="text-indigo-900 font-bold text-sm mb-2">Legal Disclaimer™</h4>
              <p className="text-indigo-700/60 text-xs leading-relaxed">
                The Collective Savers™ is a technology platform acting as an intermediary for bulk logistics. We are not the direct manufacturer of assets. All participants are subject to regional regulatory requirements and age restrictions where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
