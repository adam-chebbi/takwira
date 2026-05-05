/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_DATABASE_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_ADSENSE_PUBLISHER_ID: string
  readonly VITE_ADSENSE_SLOT_BLOG_LIST: string
  readonly VITE_ADSENSE_SLOT_SIDEBAR_TOP: string
  readonly VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM: string
  readonly VITE_ADSENSE_SLOT_INLINE: string
  readonly VITE_GOOGLE_ADS_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
