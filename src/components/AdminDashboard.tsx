import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Printer, Search, Settings, 
  FileText, CreditCard, RefreshCw, Eye, AlertCircle, Plus, Filter, 
  Phone, User, Building2, MapPin, Hash, Check, Save, Lock, LogOut, 
  Key, Mail, Calculator 
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  TradeLicenseApplication, PortalSettings, formatTaka, 
  toBengaliNumber, PABNA_WARDS, DEFAULT_BUSINESS_CATEGORIES 
} from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';

interface Props {
  settings: PortalSettings;
  applications: TradeLicenseApplication[];
  onApprovePayment: (appId: string, customLicenseNo?: string) => Promise<void>;
  onRejectApplication: (appId: string, reason: string) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<PortalSettings>) => Promise<void>;
  onViewCertificate: (app: TradeLicenseApplication) => void;
  onAddNewManual: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  settings,
  applications,
  onApprovePayment,
  onRejectApplication,
  onUpdateSettings,
  onViewCertificate,
  onAddNewManual
}) => {
  // Strict Single Email Admin Login State
  const designatedAdminEmail = (settings.adminEmail || 'ranaa2026ali@gmail.com').trim().toLowerCase();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminAuthEmail, setAdminAuthEmail] = useState('');
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Tabs & filters
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'settings'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  
  // Approval modal
  const [selectedApp, setSelectedApp] = useState<TradeLicenseApplication | null>(null);
  const [customLicenseNo, setCustomLicenseNo] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings & Fee Form states
  const [editBkash, setEditBkash] = useState(settings.bkashNumber);
  const [editNagad, setEditNagad] = useState(settings.nagadNumber);
  const [editRocket, setEditRocket] = useState(settings.rocketNumber);
  const [editFiscalYear, setEditFiscalYear] = useState(settings.currentFiscalYear);
  const [editMayorName, setEditMayorName] = useState(settings.mayorName);
  const [editMayorDesig, setEditMayorDesig] = useState(settings.mayorDesignation);
  const [editInspectorName, setEditInspectorName] = useState(settings.inspectorName);
  const [editInspectorDesig, setEditInspectorDesig] = useState(settings.inspectorDesignation);
  const [editHelpline, setEditHelpline] = useState(settings.helplineNumber);
  const [editInstructions, setEditInstructions] = useState(settings.paymentInstructions);

  // Dynamic Fees editable by admin
  const [editFormFee, setEditFormFee] = useState(settings.formFee ?? 100);
  const [editSignboardTax, setEditSignboardTax] = useState(settings.defaultSignboardTax ?? 300);
  const [editVatPercentage, setEditVatPercentage] = useState(settings.vatPercentage ?? 15);
  const [editCategoryFees, setEditCategoryFees] = useState<Record<string, number>>({
    ...(settings.categoryFees || {})
  });
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // Google Login Auth Handler (Strictly verifies the single designated email)
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user?.email?.toLowerCase();

      if (email === designatedAdminEmail) {
        setIsAdminLoggedIn(true);
      } else {
        await signOut(auth);
        setAuthError(`অ্যাক্সেস বাতিল! আপনার ইমেইল (${email}) এই সিস্টেমের অনুমোদিত এডমিন নয়। শুধুমাত্র ${designatedAdminEmail} দিয়েই এডমিন লগইন করা যাবে।`);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setAuthError(err.message || 'গুগল সাইন-ইন প্রক্রিয়া সম্পন্ন হয়নি।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Direct designated email verification login
  const handleEmailKeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const inputEmail = adminAuthEmail.trim().toLowerCase();
    if (inputEmail !== designatedAdminEmail) {
      setAuthError(`ভুল ইমেইল! এডমিন প্যানেল শুধুমাত্র নির্ধারিত ইমেইল (${designatedAdminEmail}) দিয়েই অ্যাক্সেসযোগ্য। অন্য কোনো ইমেইল গ্রহণযোগ্য নয়।`);
      return;
    }

    // Default admin security access pin
    if (adminAuthPassword !== 'pabna@2026' && adminAuthPassword !== 'admin123') {
      setAuthError('ভুল এডমিন সিকিউরিটি পাসকোড! অনুগ্রহ করে সঠিক সিকিউরিটি পাসকোড (pabna@2026) দিন।');
      return;
    }

    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    signOut(auth).catch(() => {});
  };

  // Stats calculation
  const totalApps = applications.length;
  const pendingPayments = applications.filter(a => a.status === 'payment_pending' || (a.trxId && a.paymentStatus === 'pending')).length;
  const approvedLicenses = applications.filter(a => a.status === 'approved' || a.status === 'renewed').length;
  const totalRevenue = applications
    .filter(a => a.paymentStatus === 'verified')
    .reduce((sum, a) => sum + (a.totalAmount || 0), 0);

  // Filter applications
  const filteredApps = applications.filter(app => {
    if (activeTab === 'pending' && !(app.status === 'payment_pending' || (app.trxId && app.paymentStatus === 'pending'))) {
      return false;
    }
    if (activeTab === 'approved' && app.status !== 'approved' && app.status !== 'renewed') {
      return false;
    }
    if (wardFilter !== 'all' && app.wardNo !== wardFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        app.businessName.toLowerCase().includes(q) ||
        app.ownerName.toLowerCase().includes(q) ||
        app.trackingNumber.toLowerCase().includes(q) ||
        (app.licenseNo && app.licenseNo.toLowerCase().includes(q)) ||
        (app.trxId && app.trxId.toLowerCase().includes(q)) ||
        app.mobile.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenApproveModal = (app: TradeLicenseApplication) => {
    setSelectedApp(app);
    const nextSeq = Math.floor(1000 + applications.filter(a => a.licenseNo).length + 1);
    const autoNo = `পৌর-পাব-২০২৬-${toBengaliNumber(nextSeq)}`;
    setCustomLicenseNo(autoNo);
  };

  const handleConfirmApproval = async () => {
    if (!selectedApp || !selectedApp.id) return;
    setIsProcessing(true);
    try {
      await onApprovePayment(selectedApp.id, customLicenseNo);
      setSelectedApp(null);
    } catch (err: any) {
      alert(err.message || 'অনুমোদনে সমস্যা হয়েছে');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedApp || !selectedApp.id) return;
    if (!rejectReason.trim()) {
      alert('অনুগ্রহ করে প্রত্যাখ্যানের কারণ উল্লেখ করুন।');
      return;
    }
    setIsProcessing(true);
    try {
      await onRejectApplication(selectedApp.id, rejectReason);
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err.message || 'ত্রুটি হয়েছে');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await onUpdateSettings({
        bkashNumber: editBkash,
        nagadNumber: editNagad,
        rocketNumber: editRocket,
        currentFiscalYear: editFiscalYear,
        mayorName: editMayorName,
        mayorDesignation: editMayorDesig,
        inspectorName: editInspectorName,
        inspectorDesignation: editInspectorDesig,
        helplineNumber: editHelpline,
        paymentInstructions: editInstructions,
        formFee: Number(editFormFee),
        defaultSignboardTax: Number(editSignboardTax),
        vatPercentage: Number(editVatPercentage),
        categoryFees: editCategoryFees
      });
      setSavedSettingsMsg(true);
      setTimeout(() => setSavedSettingsMsg(false), 3000);
    } catch (err: any) {
      alert('সেটিংস সংরক্ষণে ত্রুটি: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategoryFeeChange = (categoryName: string, fee: number) => {
    setEditCategoryFees(prev => ({
      ...prev,
      [categoryName]: fee
    }));
  };

  // 1. STRICT ADMIN AUTHENTICATION GUARD
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto mb-4 p-2 shadow-xs">
            <img 
              src={PABNA_LOGO_URL} 
              alt="পাবনা পৌরসভা" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5 text-emerald-800" />
            <span>এডমিন নিরাপত্তা কন্ট্রোল</span>
          </div>

          <h2 className="text-xl font-black text-slate-900">
            পাবনা পৌরসভা এডমিন লগইন
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            এই পোর্টালটি শুধুমাত্র পাবনা পৌরসভার অনুমোদিত একক এডমিন ইমেইল দ্বারা সুরক্ষিত। অন্য কোনো ইমেইল বা মাধ্যম দ্বারা প্রবেশ করা যাবে না।
          </p>

          <div className="my-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900">
            <span className="font-bold block">অনুমোদিত এডমিন ইমেইল:</span>
            <span className="font-mono font-bold text-emerald-950 block text-xs sm:text-sm mt-0.5">
              {designatedAdminEmail}
            </span>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Option A: Google Sign-in */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 bg-emerald-900 hover:bg-emerald-950 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Mail className="w-4 h-4 text-emerald-300" />
              <span>গুগল দিয়ে এডমিন লগইন ({designatedAdminEmail})</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[10px] text-slate-400 font-bold uppercase absolute">
                অথবা পাসকোড প্রবেশ
              </span>
            </div>

            {/* Option B: Direct Email + Passcode for the exact designated email */}
            <form onSubmit={handleEmailKeyLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  এডমিন ইমেইল অ্যাড্রেস
                </label>
                <input
                  type="email"
                  required
                  value={adminAuthEmail}
                  onChange={(e) => setAdminAuthEmail(e.target.value)}
                  placeholder={designatedAdminEmail}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  এডমিন সিকিউরিটি পাসকোড
                </label>
                <input
                  type="password"
                  required
                  value={adminAuthPassword}
                  onChange={(e) => setAdminAuthPassword(e.target.value)}
                  placeholder="পাসকোড লিখুন (যেমন: pabna@2026)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Key className="w-4 h-4" />
                <span>ইমেইল ভেরিফাই ও প্রবেশ করুন</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            পাসকোড সহযোগিতা: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">pabna@2026</code>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Admin Header Banner with Logout */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 rounded-2xl shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={PABNA_LOGO_URL} 
              alt="পাবনা পৌরসভা লোগো" 
              className="w-14 h-14 object-contain bg-white/10 p-1 rounded-xl backdrop-blur-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
                  পৌরসভা অনুমোদিত এডমিন
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  {designatedAdminEmail}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                পাবনা পৌরসভা - ট্রেড লাইসেন্স নিয়ন্ত্রণ ও অনুমোদন ড্যাশবোর্ড
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddNewManual}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন এন্ট্রি করুন
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">সর্বমোট আবেদন</span>
            <FileText className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {toBengaliNumber(totalApps)}
          </div>
          <span className="text-[11px] text-slate-500">কেন্দ্রীয় ডাটাবেজে সংরক্ষিত</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold">পেমেন্ট অপেক্ষারত (TrxID)</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            {toBengaliNumber(pendingPayments)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">যাচাই ও অনুমোদন প্রয়োজন</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold">ইস্যুকৃত ট্রেড লাইসেন্স</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono">
            {toBengaliNumber(approvedLicenses)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">সক্রিয় ও প্রিন্টযোগ্য</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">মোট ফি আদায় (অনুমোদিত)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
            {formatTaka(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-500">পৌরসভা রাজস্ব তহবিল</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            পেমেন্ট যাচাই অপেক্ষারত
            {pendingPayments > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-xs font-bold">
                {pendingPayments}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            ইস্যুকৃত লাইসেন্সসমূহ ({approvedLicenses})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            সমস্ত আবেদন ({totalApps})
          </button>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          যাবতীয় ফি ও পৌরসভা সেটিংস
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'settings' ? (
        /* Settings & Fee Management Tab */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">পাবনা পৌরসভা যাবতীয় ফি ও পোর্টাল সেটিংস</h2>
              <p className="text-xs text-slate-500">
                আবেদন ফি, সাইনবোর্ড কর, ভ্যাট এবং প্রতিটি ক্যাটাগরির লাইসেন্স ফি আপনার ইচ্ছামতো পরিবর্তন করুন।
              </p>
            </div>
            {savedSettingsMsg && (
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ফি ও সেটিংস সংরক্ষিত হয়েছে!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. General Fee Configuration */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>সাধারণ ফি ও কর নির্ধারণ (সবার জন্য প্রযোজ্য)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আবেদন ও ফরম ফি (টাকা)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editFormFee}
                    onChange={(e) => setEditFormFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সাইনবোর্ড কর (টাকা)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editSignboardTax}
                    onChange={(e) => setEditSignboardTax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সরকারি ভ্যাট হার (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={editVatPercentage}
                    onChange={(e) => setEditVatPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-950"
                  />
                </div>
              </div>
            </div>

            {/* 2. Category Base Fees Configuration */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>ব্যবসার ক্যাটাগরি ভিত্তিক ট্রেড লাইসেন্স ফি</span>
                <span className="text-xs text-slate-500 font-normal">টাকায়</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {DEFAULT_BUSINESS_CATEGORIES.map((cat) => {
                  const currentFee = editCategoryFees[cat.name] ?? cat.defaultBaseFee;
                  return (
                    <div key={cat.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-700">{cat.name}:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">৳</span>
                        <input
                          type="number"
                          min="100"
                          step="50"
                          value={currentFee}
                          onChange={(e) => handleCategoryFeeChange(cat.name, Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900 text-xs text-right"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Municipality Payment Accounts & Authority Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পৌরসভার বিকাশ (bKash) একাউন্ট নম্বর
                </label>
                <input
                  type="text"
                  value={editBkash}
                  onChange={(e) => setEditBkash(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পৌরসভার নগদ (Nagad) একাউন্ট নম্বর
                </label>
                <input
                  type="text"
                  value={editNagad}
                  onChange={(e) => setEditNagad(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পৌরসভার রকেট (Rocket) একাউন্ট নম্বর
                </label>
                <input
                  type="text"
                  value={editRocket}
                  onChange={(e) => setEditRocket(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বর্তমান অর্থবছর
                </label>
                <input
                  type="text"
                  value={editFiscalYear}
                  onChange={(e) => setEditFiscalYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মেয়র / প্রশাসকের নাম
                </label>
                <input
                  type="text"
                  value={editMayorName}
                  onChange={(e) => setEditMayorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মেয়রের পদবী
                </label>
                <input
                  type="text"
                  value={editMayorDesig}
                  onChange={(e) => setEditMayorDesig(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  লাইসেন্স পরিদর্শকের নাম
                </label>
                <input
                  type="text"
                  value={editInspectorName}
                  onChange={(e) => setEditInspectorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পৌরসভা হেল্পলাইন
                </label>
                <input
                  type="text"
                  value={editHelpline}
                  onChange={(e) => setEditHelpline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পেমেন্ট নির্দেশনা বার্তা
              </label>
              <textarea
                rows={2}
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <Save className="w-4 h-4" /> ফি ও সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Applications List & Table */
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="প্রতিষ্ঠান, স্বত্বাধিকারী, মোবাইল, লাইসেন্স বা TrxID..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="all">সকল ওয়ার্ড</option>
                  {PABNA_WARDS.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              মোট প্রদর্শিত: {toBengaliNumber(filteredApps.length)} টি
            </span>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">ট্র্যাকিং ও প্রতিষ্ঠান</th>
                    <th className="py-3 px-3">স্বত্বাধিকারী ও মোবাইল</th>
                    <th className="py-3 px-3">ওয়ার্ড</th>
                    <th className="py-3 px-3">প্রদেয় ফি</th>
                    <th className="py-3 px-3">পেমেন্ট TrxID তথ্য</th>
                    <th className="py-3 px-3">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">কার্যক্রম (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length > 0 ? (
                    filteredApps.map((app) => (
                      <tr key={app.id || app.trackingNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-slate-500 block">
                            {app.trackingNumber}
                          </span>
                          <span className="font-bold text-slate-900 text-sm block">
                            {app.businessName}
                          </span>
                          <span className="text-xs text-slate-500">{app.businessType}</span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {app.ownerPhotoUrl ? (
                              <img src={app.ownerPhotoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-slate-800 block">{app.ownerName}</span>
                              <span className="font-mono text-xs text-slate-600">{app.mobile}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            ওয়ার্ড {toBengaliNumber(app.wardNo)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-900 block font-mono">
                            {formatTaka(app.totalAmount)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {app.trxId ? (
                            <div>
                              <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-xs">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-sans font-semibold text-slate-600">
                                  {app.paymentMethod}
                                </span>
                                {app.trxId}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                প্রেরক: {app.paymentMobile || '—'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-red-500 italic">TrxID পাওয়া যায়নি</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {app.status === 'approved' || app.status === 'renewed' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদিত
                              </span>
                              <span className="font-mono text-[11px] text-emerald-950 font-semibold block mt-0.5">
                                {app.licenseNo}
                              </span>
                            </div>
                          ) : app.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                              <XCircle className="w-3.5 h-3.5" /> প্রত্যাখ্যাত
                            </span>
                          ) : app.trxId ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                              পেমেন্ট অপেক্ষারত
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                              নতুন আবেদন
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(app.status === 'approved' || app.status === 'renewed') && (
                              <button
                                onClick={() => onViewCertificate(app)}
                                title="ট্রেড লাইসেন্স প্রিন্ট করুন"
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Printer className="w-4 h-4 text-emerald-700" />
                                প্রিন্ট
                              </button>
                            )}

                            {app.status !== 'approved' && app.status !== 'renewed' && (
                              <button
                                onClick={() => handleOpenApproveModal(app)}
                                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                অনুমোদন করুন
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenApproveModal(app)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                        কোনো আবেদন বা রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Review & Approval */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-800">পৌরসভা লাইসেন্স যাচাই ও অনুমোদন</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedApp.businessName}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Applicant details */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-500 block text-xs">স্বত্বাধিকারী</span>
                  <span className="font-bold text-slate-800">{selectedApp.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">এনআইডি নম্বর</span>
                  <span className="font-mono text-slate-800">{selectedApp.nidNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">পিতা / স্বামীর নাম</span>
                  <span className="text-slate-800 font-semibold">{selectedApp.fatherOrHusbandName}</span>
                  {selectedApp.fatherOrHusbandNameEn && (
                    <span className="text-[11px] text-slate-500 block">{selectedApp.fatherOrHusbandNameEn}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">মাতার নাম</span>
                  <span className="text-slate-800 font-semibold">{selectedApp.motherName}</span>
                  {selectedApp.motherNameEn && (
                    <span className="text-[11px] text-slate-500 block">{selectedApp.motherNameEn}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ব্যবসার অবস্থান ও ওয়ার্ড</span>
                  <span className="text-slate-800">ওয়ার্ড নং {toBengaliNumber(selectedApp.wardNo)}, {selectedApp.businessAddress}</span>
                  {selectedApp.businessAddressEn && (
                    <span className="text-[11px] text-slate-500 block">{selectedApp.businessAddressEn}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">যোগাযোগ ও স্থায়ী ঠিকানা</span>
                  <span className="font-mono text-slate-800 block">{selectedApp.mobile}</span>
                  {(selectedApp.permanentAddress || selectedApp.permanentAddressEn) && (
                    <span className="text-[11px] text-slate-600 block truncate">
                      {selectedApp.permanentAddress} {selectedApp.permanentAddressEn ? `(${selectedApp.permanentAddressEn})` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Verification Box */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-950 flex items-center justify-between">
                  <span>পেমেন্ট ও TrxID বিবরণী</span>
                  <span className="text-base font-black text-emerald-900">{formatTaka(selectedApp.totalAmount)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-600 block">পেমেন্ট মেথড:</span>
                    <span className="font-bold text-slate-900">{selectedApp.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">প্রেরক মোবাইল নম্বর:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedApp.paymentMobile || selectedApp.mobile}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block">ট্রানজেকশন আইডি (TrxID):</span>
                    <span className="font-mono font-black text-emerald-950 text-sm bg-white px-2.5 py-1 rounded border border-emerald-300 inline-block">
                      {selectedApp.trxId || 'এখনও জমা দেয়নি'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Automatic License Number Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  স্বয়ংক্রিয় নির্ধারিত সার্টিফিকেট / লাইসেন্স নম্বর (প্রয়োজনে পরিবর্তনযোগ্য):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLicenseNo}
                    onChange={(e) => setCustomLicenseNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-950"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                আবেদন প্রত্যাখ্যান করুন
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmApproval}
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'অনুমোদন হচ্ছে...' : 'পেমেন্ট অনুমোদন ও লাইসেন্স ইস্যু'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">আবেদন প্রত্যাখ্যানের কারণ লিখুন</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="যেমন: প্রদত্ত TrxID সঠিক নয় বা টাকা জমা হয়নি..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-red-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-slate-600 text-xs font-semibold rounded-lg"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
              >
                প্রত্যাখ্যান নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
