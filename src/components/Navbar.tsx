import React, { useState } from 'react';
import { 
  Building2, FileText, Search, CreditCard, RefreshCw, 
  ShieldCheck, Phone, Menu, X, Printer, CheckCircle2 
} from 'lucide-react';
import { PortalSettings } from '../types';
import { PABNA_LOGO_URL } from './TradeLicenseCertificate';

export type NavTab = 'home' | 'apply' | 'verify' | 'payment' | 'renew' | 'admin';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  settings: PortalSettings;
  pendingCount?: number;
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  settings,
  pendingCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'হোম', icon: <Building2 className="w-4 h-4" /> },
    { id: 'apply', label: 'নতুন আবেদন', icon: <FileText className="w-4 h-4" /> },
    { id: 'verify', label: 'লাইসেন্স ভেরিফাই', icon: <Search className="w-4 h-4" /> },
    { id: 'payment', label: 'পেমেন্ট ও ট্র্যাকিং', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'renew', label: 'লাইসেন্স নবায়ন', icon: <RefreshCw className="w-4 h-4" /> },
    { 
      id: 'admin', 
      label: 'পৌরসভা এডমিন', 
      icon: <ShieldCheck className="w-4 h-4" />, 
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs print:hidden">
      {/* Top Gov Announcement Ribbon */}
      <div className="bg-emerald-900 text-white text-[11px] py-1 px-4 text-center font-medium flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | স্থানীয় সরকার বিভাগ | পাবনা পৌরসভা</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-3">
          <span>হেল্পলাইন: {settings.helplineNumber}</span>
          <span className="opacity-60">|</span>
          <span>অর্থবছর: {settings.currentFiscalYear}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img 
                src={PABNA_LOGO_URL} 
                alt="পাবনা পৌরসভা লোগো" 
                className="w-12 h-12 sm:w-13 sm:h-13 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-tight">
                  পাবনা পৌরসভা
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-200">
                  স্থাপিত ১৮৭৬
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                ই-ট্রেড লাইসেন্স ও অনলাইন ভেরিফিকেশন পোর্টাল
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                    active
                      ? item.id === 'admin'
                        ? 'bg-emerald-950 text-white shadow-xs'
                        : 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black flex items-center justify-center animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => handleNavClick('admin')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
                currentTab === 'admin' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>এডমিন</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[9px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-emerald-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black">
                    {item.badge} অপেক্ষারত
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
