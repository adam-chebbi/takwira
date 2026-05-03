
export function initAdSense() {
  const publisherId = process.env.VITE_ADSENSE_PUBLISHER_ID;
  if (!publisherId || publisherId === 'ca-pub-XXXXXXXXXX') {
    console.warn('AdSense Publisher ID not configured');
    return;
  }

  const consentStr = localStorage.getItem('takwira_cookie_consent');
  if (!consentStr) return;

  try {
    const consent = JSON.parse(consentStr);
    if (consent.advertising === true) {
      loadAdSenseScript(publisherId);
    } else {
      removeAdSenseScript();
    }
  } catch (e) {
    console.error('Error parsing cookie consent:', e);
  }
}

function loadAdSenseScript(publisherId: string) {
  if (document.getElementById('adsense-script')) return;

  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.setAttribute('crossorigin', 'anonymous');
  script.setAttribute('data-ad-client', publisherId);
  document.head.appendChild(script);
}

function removeAdSenseScript() {
  const script = document.getElementById('adsense-script');
  if (script) {
    script.remove();
  }
}
