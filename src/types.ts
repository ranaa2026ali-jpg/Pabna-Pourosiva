export interface TradeLicenseApplication {
  id?: string;
  trackingNumber: string; // e.g. "PAB-2026-84920"
  businessName: string; // ব্যবসা প্রতিষ্ঠানের নাম
  businessNameEn?: string; // Name in English
  ownerName: string; // স্বত্বাধিকারীর নাম
  ownerNameEn?: string; // Owner Name in English
  fatherOrHusbandName: string; // পিতা/স্বামীর নাম
  fatherOrHusbandNameEn?: string; // Father's/Husband's Name in English
  motherName: string; // মাতার নাম
  motherNameEn?: string; // Mother's Name in English
  businessType: string; // ব্যবসার ধরন
  nidNumber: string; // জাতীয় পরিচয়পত্র নম্বর
  mobile: string; // মোবাইল নম্বর
  email?: string;
  wardNo: string; // ওয়ার্ড নং (১-১৫)
  holdingNo?: string; // হোল্ডিং নং
  businessAddress: string; // ব্যবসা প্রতিষ্ঠানের ঠিকানা
  businessAddressEn?: string; // Business Address in English
  permanentAddress?: string; // স্থায়ী ঠিকানা
  permanentAddressEn?: string; // Permanent Address in English
  fiscalYear: string; // অর্থবছর (e.g. "২০২৫-২০২৬")
  capital: number; // প্রাক্কলিত মূলধন
  tradeFee: number; // ট্রেড লাইসেন্স ফি
  signboardTax: number; // সাইনবোর্ড কর
  vat: number; // ১৫% ভ্যাট
  serviceCharge: number; // সার্ভিস ও ফরম চার্জ (আবেদন ফি)
  totalAmount: number; // সর্বমোট ফি
  
  // Payment Details
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Cash';
  paymentMobile?: string; // প্রেরক মোবাইল নম্বর
  trxId?: string; // ট্রানজেকশন আইডি
  paymentStatus: 'pending' | 'verified' | 'rejected';
  paymentDate?: string;
  
  // Processing & Certificate Details
  status: 'submitted' | 'payment_pending' | 'payment_verified' | 'approved' | 'rejected' | 'renewed';
  licenseNo?: string; // সার্টিফিকেট নম্বর e.g. "পৌর-পাব-২০২৬-১০০৪৫"
  bookNo?: string; // বই নম্বর
  receiptNo?: string; // রশিদ নম্বর
  issueDate?: string; // ইস্যু তারিখ
  expiryDate?: string; // মেয়াদ উত্তীর্ণ তারিখ
  rejectionReason?: string;
  ownerPhotoUrl?: string; // লাইসেন্স গ্রহীতার ছবি
  securityHash?: string; // ইউনিক ডিজিটাল সিকিউরিটি হ্যাশ
  isRenewal: boolean;
  previousLicenseNo?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PortalSettings {
  id?: string;
  adminEmail: string; // নির্দিষ্ট এডমিন ইমেইল: ranaa2026ali@gmail.com
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  upayNumber?: string;
  paymentInstructions: string;
  currentFiscalYear: string;
  mayorName: string;
  mayorDesignation: string;
  inspectorName: string;
  inspectorDesignation: string;
  helplineNumber: string;
  portalNotice?: string;
  
  // Dynamic Fees Configurable by Admin
  formFee: number; // আবেদন / সার্ভিস ফরম ফি
  defaultSignboardTax: number; // সাইনবোর্ড কর
  vatPercentage: number; // ভ্যাট শতকরা হার (১৫%)
  categoryFees: Record<string, number>; // ক্যাটাগরি ভিত্তিক ট্রেড লাইসেন্স ফি
  
  updatedAt?: string;
}

// Convert English numbers to Bengali digits
export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

// Convert Bengali digits to English
export function toEnglishNumber(str: string): string {
  if (!str) return '';
  const bengaliToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bengaliToEnglish[d] || d);
}

// Format Currency in BDT
export function formatTaka(amount: number, isEnglish = false): string {
  if (isEnglish) {
    return `BDT ${amount.toLocaleString('en-US')}/-`;
  }
  return `৳ ${toBengaliNumber(amount.toLocaleString('en-US'))}/-`;
}

// Pabna Pourashava Wards list (1 to 15)
export const PABNA_WARDS = Array.from({ length: 15 }, (_, i) => ({
  value: String(i + 1),
  label: `ওয়ার্ড নং ${toBengaliNumber(i + 1)}`,
  labelEn: `Ward No. ${i + 1}`
}));

// Business Categories Default Base Fees
export const DEFAULT_BUSINESS_CATEGORIES = [
  { id: 'retail', name: 'মুদি ও সাধারণ খুচরা দোকান', nameEn: 'Grocery & General Retail Shop', defaultBaseFee: 800 },
  { id: 'wholesale', name: 'পাইকারী ব্যবসা / আড়ৎ', nameEn: 'Wholesale Trade / Warehouse', defaultBaseFee: 2500 },
  { id: 'pharmacy', name: 'ফার্মেসী ও ঔষধ বিপণি', nameEn: 'Pharmacy & Drug Store', defaultBaseFee: 1500 },
  { id: 'restaurant', name: 'হোটেল, রেস্তোরাঁ ও মিষ্টির দোকান', nameEn: 'Hotel, Restaurant & Sweetmeat', defaultBaseFee: 2000 },
  { id: 'clothing', name: 'গার্মেন্টস, ক্লথ স্টোর ও ফেব্রিক্স', nameEn: 'Garments, Cloth Store & Fabrics', defaultBaseFee: 1800 },
  { id: 'electronics', name: 'ইলেকট্রনিক্স ও মোবাইল শোরুম', nameEn: 'Electronics & Mobile Showroom', defaultBaseFee: 2200 },
  { id: 'hardware', name: 'হার্ডওয়্যার ও স্যানিটারি সামগ্রী', nameEn: 'Hardware & Sanitary Products', defaultBaseFee: 1800 },
  { id: 'construction', name: 'ঠিকাদারি ও নির্মাণ প্রতিষ্ঠান', nameEn: 'Contractor & Construction Firm', defaultBaseFee: 4000 },
  { id: 'it_services', name: 'কম্পিউটার, আইটি ও ফটোকপি সেবা', nameEn: 'Computer, IT & Photostat Service', defaultBaseFee: 1000 },
  { id: 'automobile', name: 'মোটর পার্টস ও ওয়ার্কশপ', nameEn: 'Motorcycle Parts & Workshop', defaultBaseFee: 1500 },
  { id: 'factory', name: 'ক্ষুদ্র ও মাঝারি শিল্প কারখানা', nameEn: 'Small & Medium Manufacturing Unit', defaultBaseFee: 5000 },
  { id: 'other', name: 'অন্যান্য বাণিজ্যিক প্রতিষ্ঠান', nameEn: 'Other Commercial Establishment', defaultBaseFee: 1200 }
];

export const DEFAULT_SETTINGS: PortalSettings = {
  adminEmail: 'ranaa2026ali@gmail.com', // কঠোরভাবে নির্ধারিত এক এবং একমাত্র এডমিন ইমেইল
  bkashNumber: '01712-345678 (মার্চেন্ট)',
  nagadNumber: '01819-876543 (মার্চেন্ট)',
  rocketNumber: '01911-223344 (বিল পে কোড: 429)',
  upayNumber: '01712-345678',
  paymentInstructions: 'পাবনা পৌরসভার নির্ধারিত বিকাশ, নগদ বা রকেট নম্বরে প্রদেয় সর্বমোট টাকা Send Money / Make Payment করুন। পেমেন্ট সফল হওয়ার পর প্রাপ্ত TrxID (Transaction ID) এবং প্রেরক মোবাইল নম্বর নিচের ফর্মে প্রদান করে সাবমিট করুন।',
  currentFiscalYear: '২০২৫-২০২৬',
  mayorName: 'জনাব মোঃ কামরুল হাসান',
  mayorDesignation: 'মেয়র / প্রশাসক, পাবনা পৌরসভা',
  inspectorName: 'মোঃ রফিকুল ইসলাম',
  inspectorDesignation: 'লাইসেন্স ও কর পরিদর্শক, পাবনা পৌরসভা',
  helplineNumber: '০২৫৮৮৮-৭৭২১১ / ০১৭০০-০০০০০০',
  portalNotice: 'পাবনা পৌরসভার সম্মানিত নাগরিকবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে, ২০২৫-২০২৬ অর্থবছরের সকল ট্রেড লাইসেন্স অনলাইনে আবেদন, নবায়ন ও তাৎক্ষণিক ভেরিফিকেশন করা যাবে।',
  formFee: 100,
  defaultSignboardTax: 300,
  vatPercentage: 15,
  categoryFees: {
    'মুদি ও সাধারণ খুচরা দোকান': 800,
    'পাইকারী ব্যবসা / আড়ৎ': 2500,
    'ফার্মেসী ও ঔষধ বিপণি': 1500,
    'হোটেল, রেস্তোরাঁ ও মিষ্টির দোকান': 2000,
    'গার্মেন্টস, ক্লথ স্টোর ও ফেব্রিক্স': 1800,
    'ইলেকট্রনিক্স ও মোবাইল শোরুম': 2200,
    'হার্ডওয়্যার ও স্যানিটারি সামগ্রী': 1800,
    'ঠিকাদারি ও নির্মাণ প্রতিষ্ঠান': 4000,
    'কম্পিউটার, আইটি ও ফটোকপি সেবা': 1000,
    'মোটর পার্টস ও ওয়ার্কশপ': 1500,
    'ক্ষুদ্র ও মাঝারি শিল্প কারখানা': 5000,
    'অন্যান্য বাণিজ্যিক প্রতিষ্ঠান': 1200
  }
};
