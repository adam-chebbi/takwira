
export function initGoogleAds() {
  const googleAdsId = process.env.VITE_GOOGLE_ADS_ID;
  if (!googleAdsId || googleAdsId === 'AW-XXXXXXXXXX') {
    return;
  }

  const consentStr = localStorage.getItem('takwira_cookie_consent');
  if (!consentStr) return;

  try {
    const consent = JSON.parse(consentStr);
    if (consent.advertising === true) {
      loadGtagScript(googleAdsId);
    }
  } catch (e) {
    console.error('Error parsing cookie consent for Google Ads:', e);
  }
}

function loadGtagScript(googleAdsId: string) {
  if (document.getElementById('google-ads-gtag')) return;

  const script = document.createElement('script');
  script.id = 'google-ads-gtag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.id = 'google-ads-init';
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${googleAdsId}');
  `;
  document.head.appendChild(inlineScript);
}

function hasAdvertisingConsent(): boolean {
  const consentStr = localStorage.getItem('takwira_cookie_consent');
  if (!consentStr) return false;
  try {
    const consent = JSON.parse(consentStr);
    return consent.advertising === true;
  } catch {
    return false;
  }
}

export function trackReservationSubmitted() {
  if (!hasAdvertisingConsent()) return;
  const googleAdsId = process.env.VITE_GOOGLE_ADS_ID;
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${googleAdsId}/reservation_submitted`
    });
  }
}

export function trackMatchCreated() {
  if (!hasAdvertisingConsent()) return;
  const googleAdsId = process.env.VITE_GOOGLE_ADS_ID;
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${googleAdsId}/match_created`
    });
  }
}

export function trackManagerSignup() {
  if (!hasAdvertisingConsent()) return;
  const googleAdsId = process.env.VITE_GOOGLE_ADS_ID;
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${googleAdsId}/manager_signup`
    });
  }
}

export function trackCheckin() {
  if (!hasAdvertisingConsent()) return;
  const googleAdsId = process.env.VITE_GOOGLE_ADS_ID;
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${googleAdsId}/player_checkin`
    });
  }
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
