import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const CameraQrScanner: React.FC<Props> = ({ onScanSuccess, onClose }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qrRegionId = 'qr-reader-viewport';

  const startScanner = async () => {
    setErrorMsg(null);
    setIsPermissionDenied(false);
    setIsStarting(true);

    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Prefer back camera
        config,
        (decodedText) => {
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          html5QrCode.stop().then(() => {
            onScanSuccess(decodedText);
          }).catch(() => {
            onScanSuccess(decodedText);
          });
        },
        () => {
          // Frame error (ignorable)
        }
      );

      setIsStarting(false);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setIsStarting(false);
      const isDenied = 
        err?.name === 'NotAllowedError' || 
        String(err).includes('NotAllowedError') || 
        String(err).includes('Permission denied');
      
      setIsPermissionDenied(isDenied);

      if (isDenied) {
        setErrorMsg('ক্যামেরা পারমিশন অনুমতি দেওয়া হয়নি। আপনার ব্রাউজারের অ্যাড্রেস বারের ক্যামেরা আইকনে ক্লিক করে "Allow" করুন, অথবা নিচের বাটন দিয়ে সরাসরি কিউআর কোডের ছবি আপলোড করুন।');
      } else {
        setErrorMsg('মোবাইল ক্যামেরা চালু করা সম্ভব হয়নি। আপনি ছবি আপলোড করে কিউআর ভেরিফাই করতে পারেন।');
      }
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Image File Upload for QR Scan (no camera permission needed)
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningImage(true);
    setErrorMsg(null);

    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(qrRegionId);
        scannerRef.current = scanner;
      }

      // If camera is currently scanning, stop it before scanning file
      if (scanner.isScanning) {
        await scanner.stop();
      }

      const decodedText = await scanner.scanFile(file, true);
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      onScanSuccess(decodedText);
    } catch (err: any) {
      console.warn('File QR scan error:', err);
      setErrorMsg('প্রদত্ত ছবিতে কোনো স্পষ্ট কিউআর কোড শনাক্ত করা যায়নি। অনুগ্রহ করে পরিষ্কার ছবি নির্বাচন করুন।');
    } finally {
      setScanningImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-white">কিউআর কোড স্ক্যানার</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[320px] bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/50 flex items-center justify-center">
            <div id={qrRegionId} className="w-full h-full" />

            {!isPermissionDenied && !errorMsg && (
              <div className="absolute inset-8 pointer-events-none border-2 border-emerald-400 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse flex items-center justify-center">
                <span className="text-[10px] text-emerald-300 font-mono bg-black/60 px-2 py-0.5 rounded uppercase">
                  QR কোড সোজা রাখুন
                </span>
              </div>
            )}
          </div>

          {isStarting && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>মোবাইল ক্যামেরা সংযোগ করা হচ্ছে...</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-3 p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2 text-left w-full">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">স্ক্যানিং বিজ্ঞপ্তি:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Quick Fallback: Upload Photo / Screenshot of QR */}
          <div className="w-full mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center space-y-2">
            <span className="text-xs font-semibold text-emerald-300 block">
              ক্যামেরা সমস্যা হলে সরাসরি ছবি আপলোড করুন:
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFile}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanningImage}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {scanningImage ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ছবি স্ক্যান হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>গ্যালারি বা ফাইল থেকে QR ছবি আপলোড করুন</span>
                </>
              )}
            </button>

            {isPermissionDenied && (
              <button
                onClick={startScanner}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer block mx-auto pt-1"
              >
                ক্যামেরা পুনরায় চেষ্টা করুন
              </button>
            )}
          </div>

          <div className="mt-3 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
