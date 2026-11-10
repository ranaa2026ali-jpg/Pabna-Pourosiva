import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, CheckCircle2, AlertCircle, Printer, 
  QrCode, Building2, User, Calendar, MapPin, Camera 
} from 'lucide-react';
import { TradeLicenseApplication, PortalSettings, toBengaliNumber, formatTaka } from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';
import { CameraQrScanner } from './CameraQrScanner';

interface Props {
  applications: TradeLicenseApplication[];
  settings: PortalSettings;
  initialQuery?: string;
  onViewCertificate: (app: TradeLicenseApplication) => void;
}

export const VerifyPortal: React.FC<Props> = ({
  applications,
  settings,
  initialQuery = '',
  onViewCertificate
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<TradeLicenseApplication | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery, applications]);

  const handleSearch = (queryToUse?: string) => {
    const raw = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    if (!raw) return;

    // If query is a full URL from QR scan, extract the verify parameter
    let q = raw;
    try {
      if (raw.includes('verify=')) {
        const url = new URL(raw, window.location.origin);
        q = url.searchParams.get('verify') || raw;
      }
    } catch {
      // ignore
    }

    setSearchQuery(q);
    setSearched(true);
    const normalized = q.toLowerCase();
    
    // Match by licenseNo, trackingNumber, mobile, NID, or securityHash
    const found = applications.find((app) => 
      (app.licenseNo && app.licenseNo.toLowerCase().includes(normalized)) ||
      app.trackingNumber.toLowerCase().includes(normalized) ||
      (app.nidNumber && app.nidNumber.includes(q)) ||
      (app.mobile && app.mobile.includes(q)) ||
      (app.securityHash && app.securityHash.toLowerCase().includes(normalized))
    );

    setResult(found || null);
  };

  const handleScanSuccess = (decodedText: string) => {
    setIsScannerOpen(false);
    handleSearch(decodedText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Camera QR Scanner Modal */}
      {isScannerOpen && (
        <CameraQrScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl mb-3 border border-emerald-100 shadow-xs">
          <img 
            src={PABNA_LOGO_URL} 
            alt="পাবনা পৌরসভা লোগো" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          পাবনা পৌরসভা ট্রেড লাইসেন্স অনলাইন ভেরিফিকেশন
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
          মোবাইল ক্যামেরার মাধ্যমে কিউআর কোড স্ক্যান করে অথবা লাইসেন্স নম্বর দিয়ে সরাসরি পৌরসভার ক্লাউড ডাটাবেজ থেকে সত্যতা যাচাই করুন।
        </p>
      </div>

      {/* Search Bar & Mobile Camera Scanner Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="text-sm font-semibold text-slate-700">
            ট্রেড লাইসেন্স নম্বর অথবা আবেদন ট্র্যাকিং নম্বর লিখুন:
          </label>

          {/* Mobile Camera Scan Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
            <span>মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="উদাহরণ: পৌর-পাব-২০২৬-০০১২৫ অথবা PAB-2026-10492"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" /> যাচাই করুন
          </button>
        </div>

        {/* Quick Test Samples */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>টেস্ট নমুনা:</span>
          <button
            onClick={() => {
              setSearchQuery('পৌর-পাব-২০২৬-০০১২৫');
              handleSearch('পৌর-পাব-২০২৬-০০১২৫');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-900 font-medium rounded cursor-pointer"
          >
            পৌর-পাব-২০২৬-০০১২৫ (পাবনা মিষ্টি মহল)
          </button>
          <button
            onClick={() => {
              setSearchQuery('পৌর-পাব-২০২৬-০০১২৬');
              handleSearch('পৌর-পাব-২০২৬-০০১২৬');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-900 font-medium rounded cursor-pointer"
          >
            পৌর-পাব-২০২৬-০০১২৬ (স্কয়ার মেডিকেল)
          </button>
        </div>
      </div>

      {/* Verification Result Area */}
      {searched && (
        <div className="animate-in fade-in duration-300">
          {result ? (
            <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-500 overflow-hidden">
              {/* Header Verification Banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
                        অনুমোদিত ও সক্রিয় লাইসেন্স
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">
                        {result.status === 'approved' || result.status === 'renewed' 
                          ? 'পাবনা পৌরসভা কর্তৃক অনুমোদিত বৈধ ট্রেড লাইসেন্স' 
                          : 'আবেদন প্রক্রিয়াধীন রয়েছে'}
                      </h2>
                    </div>
                  </div>

                  {(result.status === 'approved' || result.status === 'renewed') && (
                    <button
                      onClick={() => onViewCertificate(result)}
                      className="px-5 py-2.5 bg-white text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-emerald-700" />
                      সার্টিফিকেট দেখুন ও প্রিন্ট করুন
                    </button>
                  )}
                </div>
              </div>

              {/* Certificate Snapshot Card */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-xs text-slate-500 block">লাইসেন্স নম্বর</span>
                    <span className="font-bold text-emerald-950 font-mono text-base">
                      {result.licenseNo || result.trackingNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">অর্থবছর</span>
                    <span className="font-bold text-slate-800">{result.fiscalYear}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">ইস্যুর তারিখ</span>
                    <span className="font-medium text-slate-800">{result.issueDate || 'প্রক্রিয়াধীন'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">মেয়াদ শেষ</span>
                    <span className="font-bold text-emerald-800">{result.expiryDate || '৩০ জুন ২০২৬'}</span>
                  </div>
                </div>

                {/* Information Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-500 block">ব্যবসা প্রতিষ্ঠানের নাম</span>
                        <span className="font-bold text-slate-900 text-base">{result.businessName}</span>
                        {result.businessNameEn && (
                          <span className="block text-xs text-slate-500">{result.businessNameEn}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                      <User className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-500 block">মালিক / স্বত্বাধিকারী</span>
                        <span className="font-semibold text-slate-900">{result.ownerName}</span>
                        <div className="text-xs text-slate-600 mt-0.5">
                          পিতা/স্বামী: {result.fatherOrHusbandName} | মাতা: {result.motherName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                      <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-500 block">ব্যবসার ঠিকানা ও অবস্থান</span>
                        <span className="text-slate-800 font-medium">{result.businessAddress}</span>
                        <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                          পাবনা পৌরসভা ওয়ার্ড নং {toBengaliNumber(result.wardNo)}, {result.holdingNo ? `হোল্ডিং: ${result.holdingNo}` : 'পাবনা সদর'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-500 block">ব্যবসার প্রকৃতি</span>
                      <span className="font-semibold text-slate-900">{result.businessType}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-500 block">জাতীয় পরিচয়পত্র / জন্মনিবন্ধন</span>
                      <span className="font-mono text-slate-800 font-medium">{toBengaliNumber(result.nidNumber)}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-500 block">পেমেন্ট ভেরিফিকেশন ও মোট ফি</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-emerald-900">{formatTaka(result.totalAmount)}</span>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {result.paymentStatus === 'verified' ? 'পেমেন্ট অনুমোদিত' : 'পেমেন্ট প্রক্রিয়াধীন'}
                        </span>
                      </div>
                      {result.trxId && (
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          TrxID: {result.trxId} ({result.paymentMethod})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Verification Seal Note */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>
                      এই তথ্য সরাসরি <strong>পাবনা পৌরসভা কার্যালয়</strong>-এর ক্লাউড ডাটাবেজ থেকে ভেরিফাই করা হয়েছে।
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">সিস্টেম ভেরিফাইড</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">কোনো অনুমোদিত লাইসেন্স পাওয়া যায়নি</h3>
              <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                "{searchQuery}" নম্বরের বিপরীতে কোনো বৈধ লাইসেন্স রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক লাইসেন্স নম্বর অথবা আবেদন ট্র্যাকিং নম্বরটি প্রদান করুন।
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  পুনরায় চেষ্টা করুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
