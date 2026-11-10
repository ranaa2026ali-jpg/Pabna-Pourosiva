import React, { useState, useEffect } from 'react';
import { 
  collection, doc, getDocs, setDoc, updateDoc, 
  onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  TradeLicenseApplication, PortalSettings, DEFAULT_SETTINGS, 
  toBengaliNumber 
} from './types';
import { INITIAL_DEMO_APPLICATIONS } from './data/seedData';
import { Navbar, NavTab } from './components/Navbar';
import { HomePortal } from './components/HomePortal';
import { ApplyForm } from './components/ApplyForm';
import { VerifyPortal } from './components/VerifyPortal';
import { PaymentTrackPortal } from './components/PaymentTrackPortal';
import { RenewPortal } from './components/RenewPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { TradeLicenseCertificate, PABNA_LOGO_URL } from './components/TradeLicenseCertificate';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [settings, setSettings] = useState<PortalSettings>(DEFAULT_SETTINGS);
  const [applications, setApplications] = useState<TradeLicenseApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Specific states
  const [selectedAppForPayment, setSelectedAppForPayment] = useState<TradeLicenseApplication | null>(null);
  const [verifyQuery, setVerifyQuery] = useState<string>('');
  const [printingApp, setPrintingApp] = useState<TradeLicenseApplication | null>(null);

  // Read URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    const appParam = params.get('app');

    if (verifyParam) {
      setVerifyQuery(verifyParam);
      setCurrentTab('verify');
    } else if (appParam) {
      setCurrentTab('payment');
    }
  }, []);

  // 1. Subscribe to Settings doc
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'config');
    const unsubscribe = onSnapshot(settingsDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...(snapshot.data() as PortalSettings) });
      } else {
        // Seed default settings if not exists
        setDoc(settingsDocRef, DEFAULT_SETTINGS).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, 'settings/config');
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Applications collection
  useEffect(() => {
    const appsColRef = collection(db, 'applications');
    const unsubscribe = onSnapshot(appsColRef, (snapshot) => {
      if (!snapshot.empty) {
        const appsList: TradeLicenseApplication[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as TradeLicenseApplication)
        }));
        // Sort newest first
        appsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApplications(appsList);
        setLoading(false);
      } else {
        // If collection is empty, automatically seed initial demo applications
        seedInitialApplications();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to seed initial applications into Firestore
  const seedInitialApplications = async () => {
    try {
      for (const app of INITIAL_DEMO_APPLICATIONS) {
        const docRef = doc(db, 'applications', app.id!);
        await setDoc(docRef, app);
      }
      setApplications(INITIAL_DEMO_APPLICATIONS);
    } catch (err) {
      console.error('Error seeding demo applications:', err);
      // Fallback in-memory
      setApplications(INITIAL_DEMO_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  // Create new Trade License application
  const handleCreateApplication = async (appData: Omit<TradeLicenseApplication, 'id'>): Promise<TradeLicenseApplication> => {
    try {
      const docId = `app_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const appWithId: TradeLicenseApplication = {
        ...appData,
        id: docId
      };
      await setDoc(doc(db, 'applications', docId), appWithId);
      return appWithId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'applications');
      throw error;
    }
  };

  // Submit TRX ID and payment info
  const handleUpdateTrx = async (appId: string, trxId: string, paymentMobile: string, method: 'bKash' | 'Nagad' | 'Rocket') => {
    try {
      const docRef = doc(db, 'applications', appId);
      const updateData = {
        trxId,
        paymentMobile,
        paymentMethod: method,
        paymentStatus: 'pending',
        status: 'payment_pending',
        paymentDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
      throw error;
    }
  };

  // Admin approves payment and issues official license
  const handleApprovePayment = async (appId: string, customLicenseNo?: string) => {
    try {
      const docRef = doc(db, 'applications', appId);
      const app = applications.find(a => a.id === appId);
      
      const nextSeq = Math.floor(1000 + applications.filter(a => a.licenseNo).length + 1);
      const finalLicenseNo = customLicenseNo?.trim() || `পৌর-পাব-২০২৬-${toBengaliNumber(nextSeq)}`;
      
      // Bengali date format for issue
      const today = new Date();
      const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const issueDateStr = `${toBengaliNumber(today.getDate())} ${months[today.getMonth()]} ${toBengaliNumber(today.getFullYear())}`;

      const updateData = {
        status: 'approved',
        paymentStatus: 'verified',
        licenseNo: finalLicenseNo,
        receiptNo: toBengaliNumber(Math.floor(700 + Math.random() * 300)),
        bookNo: '০৪',
        issueDate: issueDateStr,
        expiryDate: '৩০ জুন ২০২৬',
        securityHash: app?.securityHash || `PAB-SEC-${Math.floor(10000 + Math.random() * 90000).toString(16).toUpperCase()}-2026`,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
      throw error;
    }
  };

  // Admin rejects application
  const handleRejectApplication = async (appId: string, reason: string) => {
    try {
      const docRef = doc(db, 'applications', appId);
      await updateDoc(docRef, {
        status: 'rejected',
        paymentStatus: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
      throw error;
    }
  };

  // Apply for renewal
  const handleApplyRenewal = async (existingApp: TradeLicenseApplication, targetFiscalYear: string): Promise<TradeLicenseApplication> => {
    try {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const newTrackingNumber = `REN-2026-${randomSuffix}`;
      const now = new Date().toISOString();

      const renewalAppData: Omit<TradeLicenseApplication, 'id'> = {
        ...existingApp,
        trackingNumber: newTrackingNumber,
        fiscalYear: targetFiscalYear,
        isRenewal: true,
        previousLicenseNo: existingApp.licenseNo || existingApp.trackingNumber,
        status: 'payment_pending',
        paymentStatus: 'pending',
        trxId: '',
        createdAt: now,
        updatedAt: now
      };

      const docId = `app_ren_${Date.now()}`;
      const appWithId: TradeLicenseApplication = {
        ...renewalAppData,
        id: docId
      };

      await setDoc(doc(db, 'applications', docId), appWithId);
      return appWithId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'applications');
      throw error;
    }
  };

  // Update Portal Settings in Firestore
  const handleUpdateSettings = async (newSettings: Partial<PortalSettings>) => {
    try {
      const settingsDocRef = doc(db, 'settings', 'config');
      await updateDoc(settingsDocRef, {
        ...newSettings,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/config');
      throw error;
    }
  };

  // Count pending payments for badge
  const pendingPaymentsCount = applications.filter(a => a.status === 'payment_pending' || (a.trxId && a.paymentStatus === 'pending')).length;
  const approvedCount = applications.filter(a => a.status === 'approved' || a.status === 'renewed').length;

  // If in Certificate Print mode:
  if (printingApp) {
    return (
      <TradeLicenseCertificate
        application={printingApp}
        settings={settings}
        onBack={() => setPrintingApp(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'verify') setVerifyQuery('');
        }}
        settings={settings}
        pendingCount={pendingPaymentsCount}
      />

      {/* Main Body Content based on active tab */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-emerald-950 font-bold text-base">পাবনা পৌরসভা সার্ভার থেকে ডাটা লোড হচ্ছে...</p>
            <p className="text-xs text-slate-500 mt-1">অনুগ্রহ করে অপেক্ষা করুন</p>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePortal
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  if (tab === 'verify') setVerifyQuery('');
                }}
                settings={settings}
                approvedCount={approvedCount}
              />
            )}

            {currentTab === 'apply' && (
              <ApplyForm
                settings={settings}
                onSubmitApplication={handleCreateApplication}
                onSuccess={(createdApp) => {
                  setSelectedAppForPayment(createdApp);
                  setCurrentTab('payment');
                }}
              />
            )}

            {currentTab === 'verify' && (
              <VerifyPortal
                applications={applications}
                settings={settings}
                initialQuery={verifyQuery}
                onViewCertificate={(app) => setPrintingApp(app)}
              />
            )}

            {currentTab === 'payment' && (
              <PaymentTrackPortal
                settings={settings}
                applications={applications}
                selectedApp={selectedAppForPayment}
                onUpdateTrx={handleUpdateTrx}
                onViewCertificate={(app) => setPrintingApp(app)}
              />
            )}

            {currentTab === 'renew' && (
              <RenewPortal
                settings={settings}
                applications={applications}
                onApplyRenewal={handleApplyRenewal}
                onSuccess={(renewedApp) => {
                  setSelectedAppForPayment(renewedApp);
                  setCurrentTab('payment');
                }}
              />
            )}

            {currentTab === 'admin' && (
              <AdminDashboard
                settings={settings}
                applications={applications}
                onApprovePayment={handleApprovePayment}
                onRejectApplication={handleRejectApplication}
                onUpdateSettings={handleUpdateSettings}
                onViewCertificate={(app) => setPrintingApp(app)}
                onAddNewManual={() => setCurrentTab('apply')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (hidden in print) */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 border-t border-slate-800 mt-auto print:hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs sm:text-sm">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={PABNA_LOGO_URL} 
                alt="পাবনা পৌরসভা" 
                className="w-10 h-10 object-contain brightness-110"
              />
              <div>
                <span className="font-bold text-white text-base block">পাবনা পৌরসভা কার্যালয়</span>
                <span className="text-[11px] text-slate-400">পাবনা সদর, পাবনা - স্থাপিত ১৮৭৬</span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              স্থানীয় সরকার (পৌরসভা) আইন ২০০৯ অনুযায়ী পাবনা পৌর এলাকার নাগরিক ও ব্যবসায়ীদের স্বচ্ছ, আধুনিক এবং ডিজিটাল ট্রেড লাইসেন্স সেবা প্রদান।
            </p>
          </div>

          <div>
            <span className="font-bold text-white text-sm block mb-3">নাগরিক সেবা লিংক</span>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('apply')} className="hover:text-emerald-400 cursor-pointer">
                  → নতুন ট্রেড লাইসেন্স আবেদন
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('verify')} className="hover:text-emerald-400 cursor-pointer">
                  → লাইসেন্স কিউআর কোড ভেরিফিকেশন
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('payment')} className="hover:text-emerald-400 cursor-pointer">
                  → মোবাইল ব্যাংকিং পেমেন্ট ও TrxID জমা
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('renew')} className="hover:text-emerald-400 cursor-pointer">
                  → ট্রেড লাইসেন্স অনলাইন নবায়ন
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white text-sm block mb-3">জরুরি হেল্পলাইন ও ঠিকানা</span>
            <p className="text-xs text-slate-300">
              পাবনা পৌরসভা ভবন, আব্দুল হামিদ রোড, পাবনা।
            </p>
            <p className="text-xs text-emerald-400 font-bold mt-2">
              ট্রেড লাইসেন্স হেল্পলাইন: {settings.helplineNumber}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ইমেইল: info@pabnapourashava.gov.bd
            </p>
            <div className="mt-3">
              <button
                onClick={() => setCurrentTab('admin')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold cursor-pointer"
              >
                পৌরসভা এডমিন প্যানেল প্রবেশ
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 mt-8 pt-4 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত - পাবনা পৌরসভা, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
        </div>
      </footer>
    </div>
  );
}
