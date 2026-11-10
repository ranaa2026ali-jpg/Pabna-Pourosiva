import React from 'react';
import { 
  Building2, FileText, Search, CreditCard, RefreshCw, 
  ShieldCheck, Printer, CheckCircle2, ArrowRight, Phone, 
  MapPin, Clock, Award, Users 
} from 'lucide-react';
import { NavTab } from './Navbar';
import { PortalSettings, toBengaliNumber } from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';

interface Props {
  onNavigate: (tab: NavTab) => void;
  settings: PortalSettings;
  approvedCount: number;
}

export const HomePortal: React.FC<Props> = ({ onNavigate, settings, approvedCount }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white pt-12 pb-16 px-4 sm:px-6">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-emerald-200">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ডিজিটাল বাংলাদেশ | স্মার্ট পাবনা পৌরসভা বিনির্মাণে</span>
          </div>

          <div className="flex justify-center">
            <img 
              src={PABNA_LOGO_URL} 
              alt="পাবনা পৌরসভা" 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              পাবনা পৌরসভা ই-ট্রেড লাইসেন্স পোর্টাল
            </h1>
            <p className="text-emerald-100 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              অনলাইনে নতুন ট্রেড লাইসেন্স আবেদন, মোবাইল ব্যাংকিং পেমেন্ট যাচাই, লাইসেন্স নবায়ন এবং কিউআর কোড সংবলিত অফিসিয়াল সনদপত্র তাৎক্ষণিক প্রিন্ট করুন।
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('apply')}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm sm:text-base rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <FileText className="w-5 h-5 text-emerald-900" />
              <span>নতুন ট্রেড লাইসেন্স আবেদন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('verify')}
              className="px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base rounded-xl backdrop-blur-md border border-white/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>লাইসেন্স ভেরিফাই করুন</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Service Cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Apply */}
          <div 
            onClick={() => onNavigate('apply')}
            className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                নতুন আবেদন
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                পাবনা পৌরসভার যে কোনো ওয়ার্ডের ব্যবসার জন্য নির্ধারিত ফি হিসাব করে আবেদন ফর্ম পূরণ করুন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>আবেদন ফর্ম শুরু করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Payment & Tracking */}
          <div 
            onClick={() => onNavigate('payment')}
            className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                পেমেন্ট ও TrxID প্রদান
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                পৌরসভার বিকাশ, নগদ বা রকেটে ফি পাঠিয়ে TrxID সাবমিট করুন ও আবেদনের অগ্রগতি জানুন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>টাকা পাঠান ও TrxID দিন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Verify & Print */}
          <div 
            onClick={() => onNavigate('verify')}
            className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                QR কোড ভেরিফিকেশন
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                কিউআর কোড স্ক্যান করে লাইসেন্সটির সত্যতা যাচাই করুন এবং অফিসিয়াল সনদ প্রিন্ট করুন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>সত্যতা যাচাই করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Renewal */}
          <div 
            onClick={() => onNavigate('renew')}
            className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                লাইসেন্স নবায়ন
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                পূর্বের লাইসেন্স নম্বর বা এনআইডি নম্বর দিয়ে চলতি অর্থবছরের ট্রেড লাইসেন্স নবায়ন করুন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>নবায়ন আবেদন করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Step by step process */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            সহজ ৪ ধাপ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            কিভাবে পাবনা পৌরসভা ট্রেড লাইসেন্স গ্রহণ করবেন
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center mx-auto mb-3">
              ১
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">অনলাইনে আবেদন</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              প্রতিষ্ঠানের নাম, মালিকের নাম, ব্যবসার ধরন ও ওয়ার্ড নম্বর দিয়ে ফর্ম সাবমিট করুন।
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center mx-auto mb-3">
              ২
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">মোবাইল ব্যাংকিং পেমেন্ট</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              পৌরসভার নির্ধারিত বিকাশ, নগদ বা রকেট নম্বরে ফি সেন্ড করে TrxID প্রদান করুন।
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center mx-auto mb-3">
              ৩
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">এডমিন অনুমোদন</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              পৌরসভা লাইসেন্স শাখা TrxID যাচাই করে স্বয়ংক্রিয় সার্টিফিকেট নম্বর ইস্যু করবে।
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center mx-auto mb-3">
              ৪
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">কিউআর কোড সনদ প্রিন্ট</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              অনুমোদন পাওয়ার পর কিউআর কোড ও পৌরসভার সিলমোহর সহ মূল ট্রেড লাইসেন্স প্রিন্ট করুন।
            </p>
          </div>
        </div>
      </section>

      {/* Official Notice & Municipality Info */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>পাবনা পৌরসভা বিজ্ঞপ্তি ({settings.currentFiscalYear})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed">
              {settings.portalNotice}
            </p>
            <div className="text-xs text-slate-500 pt-1">
              যেকোনো প্রয়োজনে যোগাযোগ: <span className="font-semibold text-emerald-900">{settings.helplineNumber}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin')}
            className="px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>পৌরসভা এডমিন লগইন</span>
          </button>
        </div>
      </section>
    </div>
  );
};
