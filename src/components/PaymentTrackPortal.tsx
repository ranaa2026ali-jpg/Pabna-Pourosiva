import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Clock, Copy, Check, Search, 
  Printer, ArrowRight, AlertCircle, Building2, Phone, ShieldCheck 
} from 'lucide-react';
import { TradeLicenseApplication, PortalSettings, formatTaka, toBengaliNumber } from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';

interface Props {
  settings: PortalSettings;
  applications: TradeLicenseApplication[];
  selectedApp?: TradeLicenseApplication | null;
  onUpdateTrx: (appId: string, trxId: string, paymentMobile: string, method: 'bKash' | 'Nagad' | 'Rocket') => Promise<void>;
  onViewCertificate: (app: TradeLicenseApplication) => void;
}

export const PaymentTrackPortal: React.FC<Props> = ({
  settings,
  applications,
  selectedApp,
  onUpdateTrx,
  onViewCertificate
}) => {
  const [searchQuery, setSearchQuery] = useState(selectedApp?.trackingNumber || '');
  const [currentApp, setCurrentApp] = useState<TradeLicenseApplication | null>(selectedApp || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states for TRX submission
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [paymentMobile, setPaymentMobile] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const found = applications.find(a => 
      a.trackingNumber.toLowerCase() === q ||
      (a.licenseNo && a.licenseNo.toLowerCase() === q) ||
      a.mobile.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
      (a.trxId && a.trxId.toLowerCase() === q)
    );

    setCurrentApp(found || null);
    if (found) {
      setPaymentMobile(found.paymentMobile || found.mobile);
      setTrxId(found.trxId || '');
    }
  };

  const handleTrxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp || !currentApp.id) return;
    if (!trxId.trim() || !paymentMobile.trim()) {
      alert('অনুগ্রহ করে প্রেরক মোবাইল নম্বর ও ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateTrx(currentApp.id, trxId.trim().toUpperCase(), paymentMobile.trim(), paymentMethod);
      setSuccessMsg(true);
      setCurrentApp(prev => prev ? {
        ...prev,
        trxId: trxId.trim().toUpperCase(),
        paymentMobile: paymentMobile.trim(),
        paymentMethod,
        paymentStatus: 'pending',
        status: 'payment_pending'
      } : null);
      setTimeout(() => setSuccessMsg(false), 5000);
    } catch (err: any) {
      alert(err.message || 'ত্রুটি হয়েছে, পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
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
          ট্রেড লাইসেন্স পেমেন্ট ও ট্র্যাকিং পোর্টাল
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
          পাবনা পৌরসভার নির্ধারিত মোবাইল ব্যাংকিং একাউন্টে ফি পরিশোধ করে TrxID জমা দিন এবং আবেদনের সর্বশেষ অগ্রগতি ট্র্যাক করুন।
        </p>
      </div>

      {/* Search Bar for tracking */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          আবেদন ট্র্যাকিং নম্বর অথবা মোবাইল নম্বর দিয়ে খুঁজুন:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="যেমন: PAB-2026-10492 অথবা 01712445566"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" /> ট্র্যাক করুন
          </button>
        </div>

        {/* Quick links to demo apps if no selection */}
        {!currentApp && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>দ্রুত টেস্ট ট্র্যাকিং:</span>
            {applications.slice(0, 3).map(app => (
              <button
                key={app.trackingNumber}
                onClick={() => {
                  setSearchQuery(app.trackingNumber);
                  setCurrentApp(app);
                  setPaymentMobile(app.paymentMobile || app.mobile);
                  setTrxId(app.trxId || '');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-900 font-medium rounded cursor-pointer"
              >
                {app.trackingNumber} ({app.businessName})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {currentApp ? (
        <div className="space-y-6">
          {/* Status Tracker Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">আবেদন ট্র্যাকিং নম্বর</span>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                  {currentApp.trackingNumber}
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  প্রতিষ্ঠান: <span className="font-bold text-slate-900">{currentApp.businessName}</span> (স্বত্বাধিকারী: {currentApp.ownerName})
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {currentApp.status === 'approved' || currentApp.status === 'renewed' ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    লাইসেন্স অনুমোদিত ও প্রস্তুত
                  </span>
                ) : currentApp.trxId ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-sm">
                    <Clock className="w-5 h-5 text-amber-700" />
                    পেমেন্ট যাচাইয়ের অপেক্ষায়
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-900 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-red-700" />
                    ফি পরিশোধ অপেক্ষারত
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-2 my-6 text-center text-xs sm:text-sm">
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-semibold border border-emerald-200">
                <div className="w-6 h-6 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-1 text-xs">১</div>
                <span>আবেদন সম্পন্ন</span>
              </div>
              <div className={`p-3 rounded-xl font-semibold border ${
                currentApp.trxId ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-xs ${
                  currentApp.trxId ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                }`}>২</div>
                <span>পেমেন্ট ও TrxID প্রদান</span>
              </div>
              <div className={`p-3 rounded-xl font-semibold border ${
                currentApp.status === 'approved' || currentApp.status === 'renewed'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-xs ${
                  currentApp.status === 'approved' || currentApp.status === 'renewed'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}>৩</div>
                <span>লাইসেন্স অনুমোদন ও প্রিন্ট</span>
              </div>
            </div>

            {/* If Approved: Certificate Ready Alert */}
            {(currentApp.status === 'approved' || currentApp.status === 'renewed') && (
              <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                    <span>অভিনন্দন! আপনার ট্রেড লাইসেন্স সফলভাবে ইস্যু করা হয়েছে</span>
                  </div>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                    লাইসেন্স নম্বর: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{currentApp.licenseNo}</span>
                  </p>
                </div>
                <button
                  onClick={() => onViewCertificate(currentApp)}
                  className="px-6 py-3 bg-white text-emerald-950 hover:bg-emerald-50 font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-5 h-5 text-emerald-700" />
                  ট্রেড লাইসেন্স প্রিন্ট করুন
                </button>
              </div>
            )}
          </div>

          {/* Payment Section (Official Pourashava Accounts & TRX Form) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Pourashava Accounts and Instructions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-lg border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <span>পাবনা পৌরসভা মোবাইল ব্যাংকিং একাউন্ট</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                সর্বমোট প্রদেয় সরকারি ফি: <strong className="text-base text-emerald-950 font-bold block sm:inline">{formatTaka(currentApp.totalAmount)}</strong>
              </div>

              {/* bKash Account */}
              <div className="p-3.5 bg-pink-50/60 rounded-xl border border-pink-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-pink-900 block">বিকাশ (bKash) একাউন্ট:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">{settings.bkashNumber}</span>
                </div>
                <button
                  onClick={() => handleCopy(settings.bkashNumber.split(' ')[0], 'bkash')}
                  className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'bkash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  কপি
                </button>
              </div>

              {/* Nagad Account */}
              <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-900 block">নগদ (Nagad) একাউন্ট:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">{settings.nagadNumber}</span>
                </div>
                <button
                  onClick={() => handleCopy(settings.nagadNumber.split(' ')[0], 'nagad')}
                  className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'nagad' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  কপি
                </button>
              </div>

              {/* Rocket Account */}
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 block">রকেট (Rocket) একাউন্ট:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">{settings.rocketNumber}</span>
                </div>
                <button
                  onClick={() => handleCopy(settings.rocketNumber.split(' ')[0], 'rocket')}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'rocket' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  কপি
                </button>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                {settings.paymentInstructions}
              </div>
            </div>

            {/* Right: TRX Submission Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-lg border-b border-slate-100 pb-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>পেমেন্ট TrxID তথ্য জমা দিন</span>
                </div>

                {successMsg && (
                  <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-900 text-xs sm:text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>TrxID সফলভাবে সংরক্ষিত হয়েছে! পৌরসভা অ্যাডমিন পেমেন্ট অনুমোদন করলে লাইসেন্স প্রিন্ট করতে পারবেন।</span>
                  </div>
                )}

                <form onSubmit={handleTrxSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      পেমেন্ট মাধ্যম নির্বাচন করুন <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                            paymentMethod === m
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      যে মোবাইল নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={paymentMobile}
                      onChange={(e) => setPaymentMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="যেমন: BKL9482701X"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      টাকা পাঠানোর পর বিকাশ/নগদের ফিরতি এসএমএস থেকে TrxID কপি করে এখানে বসান।
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>TrxID ও পেমেন্ট তথ্য সাবমিট করুন</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
                জরুরি প্রয়োজনে পাবনা পৌরসভা ট্রেড লাইসেন্স হেল্পলাইন: {settings.helplineNumber}
              </div>
            </div>
          </div>
        </div>
      ) : searchQuery ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">কোনো আবেদন পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1">"{searchQuery}" নম্বরের সাথে কোনো রেকর্ড মেলেনি। সঠিক ট্র্যাকিং বা মোবাইল নম্বর লিখুন।</p>
        </div>
      ) : null}
    </div>
  );
};
