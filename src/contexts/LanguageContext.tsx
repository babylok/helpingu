
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'zh';

type Translations = {
  [key: string]: {
    en: string;
    zh: string;
  };
};

export const translations: Translations = {
  appName: {
    en: 'KawaiiRide',
    zh: '可愛搭車'
  },
  home: {
    en: 'Home',
    zh: '主頁'
  },
  passenger: {
    en: 'Passenger',
    zh: '乘客'
  },
  driver: {
    en: 'Driver',
    zh: '司機'
  },
  signIn: {
    en: 'Sign In',
    zh: '登入'
  },
  signOut:{
    en: 'Sign Out',
    zh: '登出'
  },
  signUp: {
    en: 'Sign Up',
    zh: '註冊'
  },
  bookRide: {
    en: 'Book a Ride',
    zh: '預約車程'
  },
  heroTitle: {
    en: 'The Cutest Way to Travel in Hong Kong',
    zh: '香港最可愛的交通方式'
  },
  heroSubtitle: {
    en: 'Experience delightful ride-sharing with cute cars and friendly drivers across Hong Kong',
    zh: '在香港體驗愉快的共乘服務，有可愛的車輛和友善的司機'
  },
  rideNow: {
    en: 'Ride Now',
    zh: '立即乘坐'
  },
  becomeDriver: {
    en: 'Become a Driver',
    zh: '成為司機'
  },
  premiumVehicles: {
    en: 'Cute Vehicles',
    zh: '可愛車輛'
  },
  hkCoverage: {
    en: 'Hong Kong Coverage',
    zh: '香港覆蓋'
  },
  service247: {
    en: '24/7 Service',
    zh: '全天候服務'
  },
  secureRides: {
    en: 'Secure Rides',
    zh: '安全乘坐'
  },
  topTier: {
    en: 'Top-tier comfort',
    zh: '頂級舒適'
  },
  available: {
    en: 'Available in Hong Kong',
    zh: '香港適用'
  },
  alwaysAvailable: {
    en: 'Always available',
    zh: '隨時可用'
  },
  safetyFirst: {
    en: 'Safety first',
    zh: '安全第一'
  },
  experienceService: {
    en: 'Experience Kawaii Service',
    zh: '體驗可愛服務'
  },
  forPassengers: {
    en: 'For Passengers',
    zh: '適合乘客'
  },
  forDrivers: {
    en: 'For Drivers',
    zh: '適合司機'
  },
  openPassenger: {
    en: 'Open Passenger App',
    zh: '打開乘客應用'
  },
  startDriving: {
    en: 'Start Driving',
    zh: '開始駕駛'
  },
  features: {
    en: 'Premium Features',
    zh: '優質功能'
  },
  readyForFuture: {
    en: 'Ready for the Cutest Ride in Hong Kong?',
    zh: '準備好體驗香港最可愛的乘車服務了嗎？'
  },
  bookFirst: {
    en: 'Book Your First Ride',
    zh: '預訂您的首次乘車'
  },
  joinDriver: {
    en: 'Join as a Driver',
    zh: '成為司機'
  },
  learnMore: {
    en: 'Learn More',
    zh: '了解更多'
  },
  about: {
    en: 'About Us',
    zh: '關於我們'
  },
  howWorks: {
    en: 'How It Works',
    zh: '如何運作'
  },
  safety: {
    en: 'Safety',
    zh: '安全'
  },
  careers: {
    en: 'Careers',
    zh: '招聘資訊'
  },
  helpCenter: {
    en: 'Help Center',
    zh: '幫助中心'
  },
  blog: {
    en: 'Blog',
    zh: '網誌'
  },
  driverGuide: {
    en: 'Driver Guide',
    zh: '司機指南'
  },
  press: {
    en: 'Press',
    zh: '新聞'
  },
  terms: {
    en: 'Terms of Service',
    zh: '服務條款'
  },
  privacy: {
    en: 'Privacy Policy',
    zh: '私隱政策'
  },
  cookie: {
    en: 'Cookie Policy',
    zh: 'Cookie 政策'
  },
  licenses: {
    en: 'Licenses',
    zh: '許可證'
  },
  reserved: {
    en: 'All rights reserved.',
    zh: '版權所有。'
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    console.warn(`Translation key "${key}" not found`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
