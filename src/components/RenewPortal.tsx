import React, { useState } from 'react';
import { RefreshCw, Search, CheckCircle2, AlertCircle, ArrowRight, Building2, Calendar, FileText } from 'lucide-react';
import { TradeLicenseApplication, PortalSettings, formatTaka, toBengaliNumber } from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';

interface Props {
  settings: PortalSettings;
  applications: TradeLicenseApplication[];
  onApplyRenewal: (app: TradeLicenseApplication, targetFiscalYear: string) => Promise<TradeLicenseApplication>;
  onSuccess: (app: TradeLicenseApplication) => void;
}

export const RenewPortal: React.FC<Props> = ({
  settings,
  applications,
  onApplyRenewal,
  onSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [targetApp, setTargetApp] = useState<TradeLicenseApplication | null>(null);
  const [targetYear, setTargetYear] = useState('২০২৫-২০২৬');
  const [isRenewing, setIsRenewing] = useState(false);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    setSearched(true);
    const found = applications.find(a => 
      (a.licenseNo && a.licenseNo.toLowerCase().includes(q)) ||
      (a.nidNumber && a.nidNumber.includes(q)) ||
      a.trackingNumber.toLowerCase().includes(q)
    );

    setTargetApp(found || null);
  };

  const handleStartRenewal = async () => {
    if (!targetApp) return;
    setIsRenewing(true);
    try {
      const renewed = await onApplyRenewal(targetApp, targetYear);
      onSuccess(renewed);
    } catch (err: any) {
      alert(err.message || 'নবায়ন প্রক্রিয়ায় সমস্যা হয়েছে।');
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl mb-3 border border-emerald-100 shadow-xs">
          <img 
            src={PABNA_LOGO_URL} 
            alt="পাবনা পৌরসভা লোগো" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          ট্রেড লাইসেন্স অনলাইন নবায়ন পোর্টাল
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
          পূর্ববর্তী লাইসেন্স নম্বর অথবা জাতীয় পরিচয়পত্র (NID) নম্বর প্রদান করে নতুন অর্থবছরের জন্য আপনার ট্রেড লাইসেন্স নবায়ন করুন।
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          পূর্ববর্তী লাইসেন্স নম্বর অথবা জাতীয় পরিচয়পত্র (NID) নম্বর লিখুন:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="যেমন: পৌর-পাব-২০২৬-০০১২৫ অথবা ১৯১..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" /> অনুসন্ধান করুন
          </button>
        </div>

        {/* Quick sample test */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>দ্রুত টেস্ট নবায়ন:</span>
          <button
            onClick={() => {
              setSearchQuery('পৌর-পাব-২০২৬-০০১২৫');
              setSearched(true);
              const found = applications.find(a => a.licenseNo?.includes('০০১২৫'));
              setTargetApp(found || null);
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-900 font-medium rounded cursor-pointer"
          >
            পৌর-পাব-২০২৬-০০১২৫ (পাবনা মিষ্টি মহল)
          </button>
        </div>
      </div>

      {/* Result & Renewal Action */}
      {searched && (
        <div>
          {targetApp ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-800">বিদ্যমান লাইসেন্স রেকর্ড পাওয়া গেছে</span>
                    <h3 className="text-xl font-bold text-slate-900">{targetApp.businessName}</h3>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-800">
                  {targetApp.licenseNo || targetApp.trackingNumber}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">স্বত্বাধিকারীর নাম:</span>
                  <span className="font-bold text-slate-800">{targetApp.ownerName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ব্যবসার ধরন:</span>
                  <span className="font-medium text-slate-800">{targetApp.businessType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ওয়ার্ড ও ঠিকানা:</span>
                  <span className="text-slate-800 font-medium">ওয়ার্ড নং {toBengaliNumber(targetApp.wardNo)}, {targetApp.businessAddress}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">বর্তমান অর্থবছর ও মেয়াদ:</span>
                  <span className="text-slate-800 font-medium">{targetApp.fiscalYear} (মেয়াদ শেষ: {targetApp.expiryDate || '৩০ জুন ২০২৬'})</span>
                </div>
              </div>

              {/* Renewal Options Card */}
              <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200 space-y-4">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                  <span>নবায়ন অর্থবছর ও ফি হিসাব</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      যে অর্থবছরের জন্য নবায়ন করবেন:
                    </label>
                    <select
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium"
                    >
                      <option value="২০২৫-২০২৬">২০২৫-২০২৬ অর্থবছর</option>
                      <option value="২০২৬-২০২৭">২০২৬-২০২৭ অর্থবছর</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      নবায়ন ফি (ভ্যাট ও অন্যান্য চার্জ সহ):
                    </label>
                    <div className="text-xl font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                      {formatTaka(targetApp.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center pt-2">
                <button
                  onClick={handleStartRenewal}
                  disabled={isRenewing}
                  className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all"
                >
                  {isRenewing ? (
                    <span>নবায়ন আবেদন প্রসেস হচ্ছে...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>নবায়ন আবেদন করুন ও পেমেন্ট পেজে যান</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">কোনো রেকর্ড পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1">দয়া করে সঠিক পূর্ববর্তী লাইসেন্স নম্বর অথবা এনআইডি নম্বর লিখুন।</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
