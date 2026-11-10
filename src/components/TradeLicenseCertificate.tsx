import React, { useEffect, useState } from 'react';
import { 
  Printer, ArrowLeft, ShieldCheck, QrCode, Globe, 
  Award, Lock, CheckCircle2, User, Sparkles 
} from 'lucide-react';
import { 
  TradeLicenseApplication, PortalSettings, toBengaliNumber, 
  formatTaka, DEFAULT_BUSINESS_CATEGORIES 
} from '../types';
import { generateQrCodeDataUrl } from '../utils/qrGenerator';

interface Props {
  application: TradeLicenseApplication;
  settings: PortalSettings;
  onBack?: () => void;
}

export const PABNA_LOGO_URL = "/assets/aistudio/file_000000000f008208a1d47fb781937dc6_658bc3d0.png";

export const TradeLicenseCertificate: React.FC<Props> = ({ application, settings, onBack }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [lang, setLang] = useState<'bn' | 'en' | 'bilingual'>('bn');

  // Verification URL encoded in QR
  const verificationUrl = `${window.location.origin}?verify=${encodeURIComponent(application.licenseNo || application.trackingNumber)}`;

  // Generate security hash if not present
  const securityHash = application.securityHash || `PAB-SEC-${Math.abs(application.trackingNumber.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}-2026`;

  useEffect(() => {
    generateQrCodeDataUrl(verificationUrl).then((url) => {
      setQrCodeUrl(url);
    });
  }, [verificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  // Find English name of business category
  const catObj = DEFAULT_BUSINESS_CATEGORIES.find(c => c.name === application.businessType);
  const businessTypeEn = catObj?.nameEn || application.businessType;

  return (
    <div className="min-h-screen bg-slate-200 py-6 px-2 sm:px-4 print:p-0 print:bg-white text-slate-800">
      {/* Top action bar (hidden during print) */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-300">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> ফিরে যান
            </button>
          )}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-1.5">
              <span>ট্রেড লাইসেন্স প্রিন্ট ভিউ</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                সিকিউরড সংস্করণ
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              নং: <strong className="text-emerald-900">{application.licenseNo || application.trackingNumber}</strong>
            </p>
          </div>
        </div>

        {/* Language selector & Print button */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setLang('bn')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'bn' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇧🇩 বাংলা
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'en' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLang('bilingual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'bilingual' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 দ্বিভাষিক
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
          >
            <Printer className="w-4 h-4" /> প্রিন্ট করুন (Print A4)
          </button>
        </div>
      </div>

      {/* Printable Certificate Document */}
      <div 
        id="trade-license-paper"
        className="max-w-4xl mx-auto bg-[#fcfdfa] p-4 sm:p-7 shadow-2xl rounded-xl relative overflow-hidden print:shadow-none print:max-w-full print:m-0 print:p-6 print:rounded-none"
        style={{
          boxShadow: '0 20px 40px -15px rgba(6, 78, 59, 0.25), 0 0 0 1px rgba(6, 78, 59, 0.1)'
        }}
      >
        {/* Outer Rich Ornate Security Border with Gold & Emerald */}
        <div className="border-[6px] border-emerald-900 p-2 sm:p-2.5 relative rounded-lg bg-white shadow-inner">
          <div className="border-2 border-amber-500/80 p-1 sm:p-1.5 rounded relative">
            <div className="border-2 border-emerald-800 p-4 sm:p-6 rounded relative bg-white overflow-hidden">

              {/* Holographic Security Strip on Top */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-emerald-800 via-amber-400 via-red-500 via-teal-400 to-emerald-900 opacity-80 flex items-center justify-around text-[7px] text-white font-mono font-bold uppercase tracking-widest overflow-hidden select-none">
                <span>★ PABNA MUNICIPALITY OFFICIAL SECURITY STRIP ★</span>
                <span>★ গণপ্রজাতন্ত্রী বাংলাদেশ সরকার ★</span>
                <span className="hidden sm:inline">★ GOVERNMENT OF BANGLADESH ★</span>
                <span>★ DIGITAL TRADE LICENSE ★</span>
              </div>

              {/* High Security Multi-layered Watermark (জলছাপ) */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden"
                aria-hidden="true"
              >
                {/* Diagonal Repeating Security Text Watermark */}
                <div 
                  className="absolute inset-[-50%] w-[200%] h-[200%] rotate-[-25deg] flex flex-wrap content-start gap-y-10 gap-x-12 opacity-[0.04] text-[11px] font-mono font-black text-emerald-950 uppercase tracking-widest pointer-events-none select-none"
                >
                  {Array.from({ length: 48 }).map((_, i) => (
                    <span key={i} className="whitespace-nowrap">
                      পাবনা পৌরসভা ★ PABNA MUNICIPALITY ★ SECURE TRADE LICENSE ★
                    </span>
                  ))}
                </div>

                {/* Central High-Resolution Logo Watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <img 
                      src={PABNA_LOGO_URL} 
                      alt="Pabna Pourashava Watermark" 
                      className="w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] object-contain opacity-[0.11] filter grayscale contrast-125"
                    />
                    {/* Concentric watermark security circle rings */}
                    <div className="absolute inset-[-20px] border border-emerald-900/10 rounded-full" />
                    <div className="absolute inset-[-40px] border border-dashed border-emerald-900/10 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Anti-Fraud Microtext Security Border Line */}
              <div className="mt-3 text-[6px] tracking-widest text-emerald-900/60 uppercase font-mono text-center select-none border-b border-emerald-900/20 pb-0.5 mb-2">
                PABNA MUNICIPALITY • LOCAL GOVERNMENT DIVISION • DIGITAL TRADE LICENSE • GENUINE AND SECURE CERTIFICATE • PABNA SADAR • ESTABLISHED 1876 •
              </div>

              {/* Certificate Inner Content */}
              <div className="relative z-10 pt-1">
                {/* Header Layout */}
                <div className="border-b-2 border-emerald-900 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Top Left: Form Kha & Security Code */}
                    <div className="w-28 text-left">
                      <div className="text-[10px] font-bold text-emerald-950 leading-tight">
                        {lang === 'en' ? (
                          <>Form-B <br /><span className="text-[9px] text-slate-500">(See Rule 3)</span></>
                        ) : (
                          <>ফরম-খ <br /><span className="text-[9px] text-slate-500">(বিধি ৩ দ্রষ্টব্য)</span></>
                        )}
                      </div>
                      <div className="mt-2 text-[9px] font-mono text-slate-600 bg-slate-100 p-1 rounded border border-slate-200">
                        <span className="text-[8px] text-slate-400 block font-sans">Security Code:</span>
                        <strong className="text-emerald-900 font-bold block truncate">{securityHash}</strong>
                      </div>
                    </div>

                    {/* Top Center: Official Logo & Header Titles */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="relative mb-1">
                        <img 
                          src={PABNA_LOGO_URL} 
                          alt="পাবনা পৌরসভা লোগো" 
                          className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-md"
                        />
                      </div>

                      <div className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                        {lang === 'en' ? "Government of the People's Republic of Bangladesh" : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight mt-0.5">
                        {lang === 'en' ? 'Office of the Pabna Municipality' : 'পাবনা পৌরসভা কার্যালয়'}
                      </h1>
                      <div className="text-xs font-semibold text-slate-700">
                        {lang === 'en' ? 'Pabna Sadar, Pabna — Established: 1876' : 'পাবনা সদর, পাবনা - স্থাপিত: ১৮৭৬ খ্রিঃ'}
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                        {lang === 'en'
                          ? 'Issued under Section 98 of Local Government (Municipality) Act, 2009'
                          : 'স্থানীয় সরকার (পৌরসভা) আইন, ২০০৯ এর ধারা ৯৮ ও অষ্টম তফসিল অনুযায়ী প্রদত্ত'}
                      </div>
                    </div>

                    {/* Top Right: Licensee Photo + QR Code */}
                    <div className="w-32 flex flex-col items-end gap-1.5">
                      {/* Licensee Passport Photo with Official Municipal Stamp */}
                      <div className="relative">
                        <div className="w-20 h-24 border-2 border-emerald-800 rounded bg-slate-100 overflow-hidden shadow-xs flex items-center justify-center">
                          {application.ownerPhotoUrl ? (
                            <img 
                              src={application.ownerPhotoUrl} 
                              alt="Licensee Photograph" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <User className="w-8 h-8 text-slate-400" />
                              <span className="text-[8px] text-slate-500 font-bold mt-1 text-center">
                                {lang === 'en' ? 'PHOTO' : 'মালিকের ছবি'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Official Circular Stamp Overlay across photo */}
                        <div className="absolute -bottom-2 -left-3 pointer-events-none opacity-90 select-none">
                          <div className="w-12 h-12 rounded-full border border-red-600 border-dashed bg-white/70 backdrop-blur-2xs flex flex-col items-center justify-center p-0.5 text-center rotate-[-15deg]">
                            <span className="text-[6px] font-black text-red-700 leading-tight">পাবনা পৌরসভা</span>
                            <span className="text-[5px] text-emerald-800 font-bold">সত্যায়িত</span>
                          </div>
                        </div>
                      </div>

                      {/* Small QR badge */}
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-emerald-800 uppercase block font-mono">
                          {lang === 'en' ? 'SCAN TO VERIFY' : 'স্ক্যান টু ভেরিফাই'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title Banner */}
                  <div className="text-center mt-3">
                    <div className="inline-block bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 text-amber-300 border-2 border-amber-400 px-8 py-1 rounded-full shadow-md">
                      <span className="text-sm sm:text-base font-black tracking-widest uppercase">
                        {lang === 'en' 
                          ? 'E-TRADE LICENSE CERTIFICATE' 
                          : lang === 'bilingual' 
                          ? 'ই-ট্রেড লাইসেন্স সনদ (E-TRADE LICENSE)' 
                          : 'ই-ট্রেড লাইসেন্স সনদপত্র'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta Ribbon Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-lg border border-emerald-300 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      {lang === 'en' ? 'License Number:' : 'লাইসেন্স নম্বর:'}
                    </span>
                    <span className="font-bold text-emerald-950 font-mono text-sm sm:text-base">
                      {lang === 'en' 
                        ? (application.licenseNo || application.trackingNumber)
                        : (application.licenseNo || application.trackingNumber)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      {lang === 'en' ? 'Fiscal Year:' : 'অর্থবছর:'}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {lang === 'en' ? '2025-2026' : application.fiscalYear}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      {lang === 'en' ? 'Date of Issue:' : 'ইস্যুর তারিখ:'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {lang === 'en' ? 'July 15, 2025' : (application.issueDate || '১৫ জুলাই ২০২৫')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      {lang === 'en' ? 'Valid Upto:' : 'মেয়াদ উত্তীর্ণ:'}
                    </span>
                    <span className="font-black text-red-700">
                      {lang === 'en' ? 'June 30, 2026' : (application.expiryDate || '৩০ জুন ২০২৬')}
                    </span>
                  </div>
                </div>

                {/* Main Information Table */}
                <div className="border-2 border-emerald-900/30 rounded-lg overflow-hidden my-3 text-xs sm:text-[13px] bg-white">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-8 text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">১</td>
                        <td className="w-48 sm:w-56 py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? 'Name of Enterprise' : 'ব্যবসা প্রতিষ্ঠানের নাম'}
                        </td>
                        <td className="py-2 px-3 font-black text-emerald-950 text-sm sm:text-base">
                          {lang === 'en' ? (application.businessNameEn || application.businessName) : application.businessName}
                          {lang === 'bilingual' && application.businessNameEn && (
                            <span className="block text-xs font-normal text-slate-600 font-sans mt-0.5">
                              {application.businessNameEn}
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">২</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? "Proprietor / Owner's Name" : 'স্বত্বাধিকারী / মালিকের নাম'}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {lang === 'en' ? (application.ownerNameEn || application.ownerName) : application.ownerName}
                          {lang === 'bilingual' && application.ownerNameEn && (
                            <span className="block text-xs font-normal text-slate-600 font-sans mt-0.5">
                              {application.ownerNameEn}
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৩</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? "Father's / Husband's Name" : 'পিতা / স্বামীর নাম'}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-medium">
                          {lang === 'en' 
                            ? (application.fatherOrHusbandNameEn || application.fatherOrHusbandName)
                            : application.fatherOrHusbandName}
                          {lang === 'bilingual' && application.fatherOrHusbandNameEn && (
                            <span className="block text-xs font-normal text-slate-600 font-sans mt-0.5">
                              {application.fatherOrHusbandNameEn}
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৪</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? "Mother's Name" : 'মাতার নাম'}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-medium">
                          {lang === 'en' 
                            ? (application.motherNameEn || application.motherName)
                            : application.motherName}
                          {lang === 'bilingual' && application.motherNameEn && (
                            <span className="block text-xs font-normal text-slate-600 font-sans mt-0.5">
                              {application.motherNameEn}
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৫</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? 'National ID / Birth Reg. No.' : 'জাতীয় পরিচয়পত্র / জন্মনিবন্ধন নং'}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {lang === 'en' ? application.nidNumber : toBengaliNumber(application.nidNumber)}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৬</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? 'Nature / Type of Business' : 'ব্যবসার প্রকৃতি ও ধরন'}
                        </td>
                        <td className="py-2 px-3 text-slate-900 font-semibold">
                          {lang === 'en' ? businessTypeEn : application.businessType}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৭</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? 'Pourashava Ward & Holding No.' : 'পৌরসভা ওয়ার্ড ও হোল্ডিং নং'}
                        </td>
                        <td className="py-2 px-3 text-slate-800">
                          {lang === 'en' 
                            ? `Ward No: ${application.wardNo}, Holding: ${application.holdingNo || 'N/A'}, Pabna Sadar`
                            : `ওয়ার্ড নং- ${toBengaliNumber(application.wardNo)}, ${application.holdingNo ? `হোল্ডিং: ${application.holdingNo}` : 'পাবনা সদর'}`}
                        </td>
                      </tr>

                      <tr className="border-b border-slate-200">
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৮</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? 'Business Establishment Address' : 'ব্যবসা প্রতিষ্ঠানের পূর্ণ ঠিকানা'}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-medium">
                          {lang === 'en'
                            ? (application.businessAddressEn || application.businessAddress)
                            : application.businessAddress}
                          {lang === 'bilingual' && application.businessAddressEn && (
                            <span className="block text-xs font-normal text-slate-600 font-sans mt-0.5">
                              {application.businessAddressEn}
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td className="text-center py-2 px-2 font-bold bg-emerald-50/50 text-emerald-900">৯</td>
                        <td className="py-2 px-3 font-semibold text-slate-700 bg-slate-50/80">
                          {lang === 'en' ? 'Mobile & Permanent Address' : 'মালিকের মোবাইল ও স্থায়ী ঠিকানা'}
                        </td>
                        <td className="py-2 px-3 text-slate-800">
                          {lang === 'en' ? 'Mobile: ' : 'মোবাইল: '} 
                          <span className="font-mono font-bold">{application.mobile}</span>
                          {(application.permanentAddress || application.permanentAddressEn) && (
                            <>
                              {' | '}
                              {lang === 'en' 
                                ? (application.permanentAddressEn || application.permanentAddress)
                                : application.permanentAddress}
                            </>
                          )}
                          {lang === 'bilingual' && application.permanentAddressEn && (
                            <span className="block text-xs font-normal text-slate-600 font-sans mt-0.5">
                              {application.permanentAddressEn}
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom Row: Fees, QR Code, Verification Seal */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-3">
                  {/* Fee Breakdown (col-span-5) */}
                  <div className="sm:col-span-5 border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-xs">
                    <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                      <span>{lang === 'en' ? 'Fees & Tax Particulars' : 'ফি ও কর বিবরণী'}</span>
                      <span className="text-[10px] text-emerald-800 font-mono">
                        {lang === 'en' ? `Receipt: ${application.receiptNo || '745'}` : `রশিদ নং: ${application.receiptNo || '৭৪৫'}`}
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>{lang === 'en' ? 'Trade License Fee:' : 'ট্রেড লাইসেন্স ফি:'}</span>
                        <span className="font-medium text-slate-900">{formatTaka(application.tradeFee, lang === 'en')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'en' ? 'Signboard Tax:' : 'সাইনবোর্ড কর:'}</span>
                        <span className="font-medium text-slate-900">{formatTaka(application.signboardTax, lang === 'en')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'en' ? '15% Govt. VAT:' : '১৫% সরকারি ভ্যাট:'}</span>
                        <span className="font-medium text-slate-900">{formatTaka(application.vat, lang === 'en')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'en' ? 'Form & Service Fee:' : 'ফরম ও আবেদন ফি:'}</span>
                        <span className="font-medium text-slate-900">{formatTaka(application.serviceCharge, lang === 'en')}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-1 font-black text-emerald-950 text-xs sm:text-sm">
                        <span>{lang === 'en' ? 'Total Amount Paid:' : 'সর্বমোট পরিশোধিত টাকা:'}</span>
                        <span>{formatTaka(application.totalAmount, lang === 'en')}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Digital Hash (col-span-4) */}
                  <div className="sm:col-span-4 border border-emerald-300 rounded-lg p-2.5 bg-emerald-50/40 text-xs flex items-center gap-3">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="Security QR Code" 
                        className="w-20 h-20 border border-slate-300 p-0.5 bg-white rounded shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center border border-slate-300 rounded">
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-900 text-white rounded-lg text-xs font-black tracking-wider uppercase shadow-xs">
                        <QrCode className="w-3.5 h-3.5 text-amber-300" />
                        <span>{lang === 'en' ? 'SCAN TO VERIFY' : 'স্ক্যান টু ভেরিফাই'}</span>
                      </div>
                      <div className="mt-1 text-[9px] font-mono font-bold text-slate-700">
                        {application.licenseNo || application.trackingNumber}
                      </div>
                    </div>
                  </div>

                  {/* Golden Municipal Security Badge (col-span-3) */}
                  <div className="sm:col-span-3 border border-amber-300 rounded-lg p-2 bg-gradient-to-br from-amber-50 to-amber-100/60 flex flex-col items-center justify-center text-center">
                    <Award className="w-7 h-7 text-amber-600 mb-0.5" />
                    <span className="text-[10px] font-black text-amber-950 uppercase tracking-tight">
                      {lang === 'en' ? 'AUTHENTIC SEAL' : 'পাবনা পৌরসভা'}
                    </span>
                    <span className="text-[8px] text-emerald-800 font-bold">
                      {lang === 'en' ? 'Govt. Approved' : 'স্থানীয় সরকার অনুমোদিত'}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                      {application.fiscalYear}
                    </span>
                  </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="my-2 p-2 bg-slate-50 rounded border border-slate-200 text-[9px] sm:text-[10px] text-slate-600 leading-normal">
                  <span className="font-bold text-slate-800">
                    {lang === 'en' ? 'TERMS & CONDITIONS: ' : 'শর্তাবলী: '}
                  </span>
                  {lang === 'en' ? (
                    '1. This Trade License is non-transferable and valid exclusively for the declared business and location. 2. No unlawful activity contrary to Pourashava bylaws shall be conducted. 3. This certificate must be hung in a conspicuous place at the enterprise. 4. Annual renewal must be completed before 30th June of each fiscal year.'
                  ) : (
                    '১. এই ট্রেড লাইসেন্স হস্তান্তরযোগ্য নহে এবং কেবল ঘোষিত ব্যবসার জন্য প্রযোজ্য। ২. কোনো অবৈধ বা পৌরসভার আদেশ পরিপন্থী কার্যকলাপ চালানো যাইবে না। ৩. লাইসেন্সটি ব্যবসা প্রতিষ্ঠানের দৃশ্যমান স্থানে প্রদর্শন করিতে হইবে। ৪. প্রতি বছর ৩০ জুনের মধ্যে বিধি মোতাবেক লাইসেন্স নবায়ন করিতে হইবে।'
                  )}
                </div>

                {/* Official Signatures Section */}
                <div className="grid grid-cols-2 gap-8 mt-6 pt-3 border-t border-dashed border-slate-300 text-center">
                  {/* Inspector Signature */}
                  <div className="flex flex-col items-center">
                    <div className="h-9 flex items-end">
                      <span className="font-serif italic text-sm text-emerald-950 font-bold tracking-widest border-b border-emerald-800 pb-0.5">
                        {settings.inspectorName || 'Md. Rafiqul Islam'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {lang === 'en' ? 'License & Tax Inspector' : (settings.inspectorDesignation || 'লাইসেন্স ও কর পরিদর্শক')}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      {lang === 'en' ? 'Pabna Municipality, Pabna' : 'পাবনা পৌরসভা, পাবনা'}
                    </div>
                  </div>

                  {/* Mayor Signature & Stamp */}
                  <div className="flex flex-col items-center relative">
                    {/* Official Municipal Circular Seal Stamp */}
                    <div className="absolute -top-7 right-3 sm:right-10 pointer-events-none opacity-85 select-none rotate-[-12deg]">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-emerald-700 border-dashed flex flex-col items-center justify-center p-1 text-center bg-white/50 backdrop-blur-2xs">
                        <span className="text-[7px] font-black text-emerald-950 uppercase">পাবনা পৌরসভা</span>
                        <span className="text-[6px] text-red-700 font-black">অনুমোদিত</span>
                        <span className="text-[6px] text-emerald-800">সিলমোহর</span>
                      </div>
                    </div>

                    <div className="h-9 flex items-end">
                      <span className="font-serif italic text-sm text-emerald-950 font-bold tracking-widest border-b border-emerald-800 pb-0.5">
                        {settings.mayorName || 'Md. Kamrul Hasan'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {lang === 'en' ? 'Mayor / Administrator' : (settings.mayorDesignation || 'মেয়র / প্রশাসক')}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      {lang === 'en' ? 'Pabna Municipality, Pabna' : 'পাবনা পৌরসভা, পাবনা'}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Note */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-500 flex flex-wrap justify-between items-center select-none">
                  <span>Portal: www.pabnapourashava.gov.bd</span>
                  <span>Security Barcode: |||| | ||||| |||| || |||||||| |||</span>
                  <span>Verification Helpline: {settings.helplineNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
