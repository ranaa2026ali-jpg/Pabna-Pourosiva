import React, { useState } from 'react';
import { 
  Building2, User, MapPin, Calculator, ShieldCheck, ArrowRight, 
  Upload, CheckCircle2, FileText, AlertTriangle, Camera, Trash2 
} from 'lucide-react';
import { 
  TradeLicenseApplication, PortalSettings, PABNA_WARDS, 
  DEFAULT_BUSINESS_CATEGORIES, toBengaliNumber, formatTaka 
} from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';

interface Props {
  settings: PortalSettings;
  onSubmitApplication: (appData: Omit<TradeLicenseApplication, 'id'>) => Promise<TradeLicenseApplication>;
  onSuccess: (app: TradeLicenseApplication) => void;
}

export const ApplyForm: React.FC<Props> = ({ settings, onSubmitApplication, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [businessNameEn, setBusinessNameEn] = useState('');
  const [businessType, setBusinessType] = useState(DEFAULT_BUSINESS_CATEGORIES[0].name);
  const [capital, setCapital] = useState<number>(100000);
  
  const [ownerName, setOwnerName] = useState('');
  const [ownerNameEn, setOwnerNameEn] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [fatherOrHusbandNameEn, setFatherOrHusbandNameEn] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherNameEn, setMotherNameEn] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [permanentAddressEn, setPermanentAddressEn] = useState('');

  const [wardNo, setWardNo] = useState('১');
  const [holdingNo, setHoldingNo] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessAddressEn, setBusinessAddressEn] = useState('');
  
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState<string>('');

  // Dynamic fee calculation derived from Admin-configured settings
  const baseCategoryFee = settings.categoryFees?.[businessType] ?? 1200;
  const capitalExtraFee = capital > 500000 ? Math.floor((capital - 500000) / 100000) * 200 : 0;
  const tradeFee = baseCategoryFee + capitalExtraFee;
  const signboardTax = settings.defaultSignboardTax ?? 300;
  const vatPercentage = settings.vatPercentage ?? 15;
  const vat = Math.round((tradeFee + signboardTax) * (vatPercentage / 100));
  const serviceCharge = settings.formFee ?? 100;
  const totalAmount = tradeFee + signboardTax + vat + serviceCharge;

  // Photo compression / handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize to passport photo aspect ratio max 300x360
          const canvas = document.createElement('canvas');
          const maxW = 300;
          const maxH = 360;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxW) {
              height *= maxW / width;
              width = maxW;
            }
          } else {
            if (height > maxH) {
              width *= maxH / height;
              height = maxH;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setOwnerPhotoUrl(compressedDataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !ownerName.trim() || !fatherOrHusbandName.trim() || !motherName.trim() || !nidNumber.trim() || !mobile.trim() || !businessAddress.trim()) {
      setError('অনুগ্রহ করে সকল আবশ্যকীয় তথ্য (তারকা চিহ্নিত) পূরণ করুন।');
      return;
    }

    if (mobile.length < 11) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const trackingNumber = `PAB-2026-${randomSuffix}`;
      const now = new Date().toISOString();

      const newAppData: Omit<TradeLicenseApplication, 'id'> = {
        trackingNumber,
        businessName: businessName.trim(),
        businessNameEn: businessNameEn.trim(),
        ownerName: ownerName.trim(),
        ownerNameEn: ownerNameEn.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
        fatherOrHusbandNameEn: fatherOrHusbandNameEn.trim(),
        motherName: motherName.trim(),
        motherNameEn: motherNameEn.trim(),
        businessType,
        nidNumber: nidNumber.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        wardNo,
        holdingNo: holdingNo.trim(),
        businessAddress: businessAddress.trim(),
        businessAddressEn: businessAddressEn.trim(),
        permanentAddress: permanentAddress.trim(),
        permanentAddressEn: permanentAddressEn.trim(),
        fiscalYear: settings.currentFiscalYear || '২০২৫-২০২৬',
        capital,
        tradeFee,
        signboardTax,
        vat,
        serviceCharge,
        totalAmount,
        paymentMethod: 'bKash',
        paymentStatus: 'pending',
        status: 'payment_pending',
        ownerPhotoUrl: ownerPhotoUrl || '',
        isRenewal: false,
        createdAt: now,
        updatedAt: now
      };

      const created = await onSubmitApplication(newAppData);
      onSuccess(created);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'আবেদন জমা দিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl mb-3 border border-emerald-100 shadow-xs">
          <img 
            src={PABNA_LOGO_URL} 
            alt="পাবনা পৌরসভা লোগো" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          নতুন ই-ট্রেড লাইসেন্স আবেদন ফর্ম
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
          পাবনা পৌরসভা এলাকার সকল ধরনের ব্যবসা বা পেশার জন্য স্থানীয় সরকার (পৌরসভা) আইন ২০০৯ অনুযায়ী অনলাইনে ট্রেড লাইসেন্সের আবেদন করুন।
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Business Details */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>১. ব্যবসা প্রতিষ্ঠানের সাধারণ তথ্য</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ব্যবসা প্রতিষ্ঠানের নাম (বাংলায়) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="যেমন: মেসার্স পদ্মা এন্টারপ্রাইজ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name of Enterprise (English)
              </label>
              <input
                type="text"
                value={businessNameEn}
                onChange={(e) => setBusinessNameEn(e.target.value)}
                placeholder="e.g. M/S Padma Enterprise"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ব্যবসার প্রকৃতি ও ক্যাটাগরি <span className="text-red-500">*</span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {DEFAULT_BUSINESS_CATEGORIES.map((cat) => {
                  const fee = settings.categoryFees?.[cat.name] ?? cat.defaultBaseFee;
                  return (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} (ফি: ৳ {fee})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                প্রাক্কলিত ব্যবসায়িক মূলধন (টাকায়) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="10000"
                step="10000"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                বাংলায়: {toBengaliNumber(capital.toLocaleString())} টাকা
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Owner Information + Photo Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg">
              <User className="w-5 h-5 text-emerald-700" />
              <span>২. স্বত্বাধিকারী / মালিকের ব্যক্তিগত তথ্য ও ছবি</span>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              সার্টিফিকেটে ছবি প্রদর্শিত হবে
            </span>
          </div>

          {/* Photo Uploader Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-5">
            <div className="relative w-24 h-28 border-2 border-dashed border-emerald-600/60 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {ownerPhotoUrl ? (
                <>
                  <img 
                    src={ownerPhotoUrl} 
                    alt="Owner Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => setOwnerPhotoUrl('')}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                    title="ছবি মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-2">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold block">পাসপোর্ট ছবি</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                লাইসেন্স গ্রহীতার পাসপোর্ট সাইজ ছবি আপলোড করুন
              </label>
              <p className="text-xs text-slate-500 mb-2">
                ছবিটি মূল ট্রেড লাইসেন্স সার্টিফিকেটের উপরে পৌরসভার সত্যায়িত সিলমোহর সহ মুদ্রিত হবে। (সর্বোচ্চ ৫ মেগাবাইট)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মালিকের নাম (বাংলায়) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="যেমন: মোঃ কামরুল হাসান"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner's Name (English)
              </label>
              <input
                type="text"
                value={ownerNameEn}
                onChange={(e) => setOwnerNameEn(e.target.value)}
                placeholder="e.g. Md. Kamrul Hasan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পিতা / স্বামীর নাম (বাংলায়) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
                placeholder="পিতা অথবা স্বামীর নাম বাংলায়"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father's / Husband's Name (English)
              </label>
              <input
                type="text"
                value={fatherOrHusbandNameEn}
                onChange={(e) => setFatherOrHusbandNameEn(e.target.value)}
                placeholder="e.g. Md. Rafiqul Islam"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মাতার নাম (বাংলায়) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="মাতার নাম বাংলায়"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mother's Name (English)
              </label>
              <input
                type="text"
                value={motherNameEn}
                onChange={(e) => setMotherNameEn(e.target.value)}
                placeholder="e.g. Most. Jahanara Begum"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                placeholder="১০, ১৩ বা ১৭ ডিজিটের এনআইডি"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="যেমন: 01712345678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মালিকের স্থায়ী ঠিকানা (বাংলায়)
              </label>
              <input
                type="text"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permanent Address (English)
              </label>
              <input
                type="text"
                value={permanentAddressEn}
                onChange={(e) => setPermanentAddressEn(e.target.value)}
                placeholder="e.g. Radhanagar, Pabna Sadar, Pabna"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Business Location in Pabna */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>৩. ব্যবসা প্রতিষ্ঠানের অবস্থান ও ওয়ার্ড</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পাবনা পৌরসভা ওয়ার্ড নম্বর <span className="text-red-500">*</span>
              </label>
              <select
                value={wardNo}
                onChange={(e) => setWardNo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {PABNA_WARDS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label} (পাবনা পৌর এলাকা)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                হোল্ডিং নম্বর / দোকান নম্বর (যদি থাকে)
              </label>
              <input
                type="text"
                value={holdingNo}
                onChange={(e) => setHoldingNo(e.target.value)}
                placeholder="যেমন: হোল্ডিং-১২/খ অথবা দোকান-০৫"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ব্যবসা প্রতিষ্ঠানের পূর্ণাঙ্গ ঠিকানা (বাংলায়) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="যেমন: দোকান নং ৩, আব্দুল হামিদ রোড, পাবনা বাজার, পাবনা"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Establishment Address (English)
              </label>
              <input
                type="text"
                value={businessAddressEn}
                onChange={(e) => setBusinessAddressEn(e.target.value)}
                placeholder="e.g. Shop No 3, Abdul Hamid Road, Pabna Bazar, Pabna"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Automated Fee Calculation Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-6 border-2 border-emerald-300/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-4">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-lg">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <span>৪. ট্রেড লাইসেন্স সরকারি ফি হিসাব</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-200/80 text-emerald-900">
              অর্থবছর: {settings.currentFiscalYear || '২০২৫-২০২৬'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-slate-500 block">ট্রেড লাইসেন্স ফি</span>
              <span className="font-bold text-slate-800 text-base">{formatTaka(tradeFee)}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-slate-500 block">সাইনবোর্ড কর</span>
              <span className="font-bold text-slate-800 text-base">{formatTaka(signboardTax)}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-slate-500 block">{toBengaliNumber(vatPercentage)}% সরকারি ভ্যাট</span>
              <span className="font-bold text-slate-800 text-base">{formatTaka(vat)}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-slate-500 block">আবেদন ও ফরম ফি</span>
              <span className="font-bold text-slate-800 text-base">{formatTaka(serviceCharge)}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-600 block">সর্বমোট প্রদেয় সরকারি ফি:</span>
              <span className="text-2xl font-black text-emerald-900">{formatTaka(totalAmount)}</span>
            </div>
            <div className="text-xs text-slate-600 max-w-sm text-right sm:text-left">
              * আবেদন জমা দেওয়ার পর পরবর্তী ধাপে পাবনা পৌরসভার অফিসিয়াল বিকাশ/নগদ নম্বরে টাকা পাঠিয়ে TrxID প্রদান করতে হবে।
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-10 py-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-white font-bold text-base rounded-xl shadow-md flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
          >
            {submitting ? (
              <span>আবেদন প্রসেস হচ্ছে...</span>
            ) : (
              <>
                <span>আবেদন জমা দিন এবং পেমেন্ট ধাপে যান</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
