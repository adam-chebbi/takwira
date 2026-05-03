import * as React from 'react';
import { initAdSense } from '../lib/adsense';
import { initGoogleAds } from '../lib/googleAds';

interface CookieConsent {
  version: string;
  timestamp: string;
  analytics: boolean;
  advertising: boolean;
  decided: boolean;
}

interface CookieContextType {
  consent: CookieConsent;
  hasDecided: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (analytics: boolean, advertising: boolean) => void;
  canTrackAnalytics: boolean;
  canTrackAdvertising: boolean;
  resetConsent: () => void;
}

const STORAGE_KEY = 'takwira_cookie_consent';
const DEFAULT_CONSENT: CookieConsent = {
  version: '1.0',
  timestamp: new Date().toISOString(),
  analytics: false,
  advertising: false,
  decided: false,
};

const CookieContext = React.createContext<CookieContextType | null>(null);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = React.useState<CookieConsent>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_CONSENT;
      }
    }
    return DEFAULT_CONSENT;
  });

  const saveToStorage = (newConsent: CookieConsent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
  };

  const acceptAll = () => {
    saveToStorage({
      ...consent,
      analytics: true,
      advertising: true,
      decided: true,
      timestamp: new Date().toISOString(),
    });
  };

  const rejectAll = () => {
    saveToStorage({
      ...consent,
      analytics: false,
      advertising: false,
      decided: true,
      timestamp: new Date().toISOString(),
    });
  };

  const saveCustom = (analytics: boolean, advertising: boolean) => {
    saveToStorage({
      ...consent,
      analytics,
      advertising,
      decided: true,
      timestamp: new Date().toISOString(),
    });
  };

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(DEFAULT_CONSENT);
  };

  React.useEffect(() => {
    initAdSense();
    initGoogleAds();
  }, [consent.advertising]);

  const value: CookieContextType = {
    consent,
    hasDecided: consent.decided,
    acceptAll,
    rejectAll,
    saveCustom,
    canTrackAnalytics: consent.analytics,
    canTrackAdvertising: consent.advertising,
    resetConsent,
  };

  return (
    <CookieContext.Provider value={value}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookie() {
  const context = React.useContext(CookieContext);
  if (!context) {
    throw new Error('useCookie must be used within a CookieProvider');
  }
  return context;
}
