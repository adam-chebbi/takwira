# Takwira - N°1 du Foot en Tunisie 🇹🇳

Takwira est une plateforme moderne pour la gestion et la réservation de terrains de football, ainsi que l'organisation de matchs entre joueurs.

## 🚀 Configuration et Installation

### 1. Variables d'Environnement (.env)

Créez un fichier `.env` à la racine (ou utilisez les secrets de votre plateforme de déploiement) avec les variables suivantes :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_DATABASE_ID=(default)
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
```

### 2. Configuration Google AdSense & Ads

Pour une documentation détaillée sur l'obtention des identifiants (Publisher ID, Slot IDs, Conversion Tracking), consultez le fichier [GOOGLE_ADS_GUIDE.md](./GOOGLE_ADS_GUIDE.md).

1.  Obtenez votre **Publisher ID** (au format `ca-pub-XXXXXXXXXXXXXXXX`) depuis votre tableau de bord Google AdSense.
2.  Ajoutez-le à votre fichier `.env` ou aux variables d'environnement de votre plateforme.
3.  Une fois déployé, votre site doit être validé par AdSense pour que les publicités s'affichent.

### 3. Configuration Google Ads (Conversion Tracking)

1.  Obtenez votre **Google Ads ID** (au format `AW-XXXXXXXXXX`) depuis votre compte Google Ads.
2.  Créez manuellement les actions de conversion suivantes dans l'interface Google Ads pour obtenir les IDs correspondants si nécessaire (le code utilise des noms d'événements personnalisés) :
    *   `reservation_submitted` : Suivi des réservations réussies.
    *   `match_created` : Suivi des créations de matchs par les organisateurs.
    *   `manager_signup` : Suivi des inscriptions de nouveaux complexes (onboarding).
    *   `player_checkin` : Suivi des check-ins des joueurs sur les pages de match.
3.  Ajoutez `VITE_GOOGLE_ADS_ID` à votre configuration.
4.  Note: Le suivi ne s'active que si l'utilisateur accepte les cookies publicitaires.

### 4. Configuration Firebase

Pour que l'application fonctionne parfaitement :

1.  **Authentication** : Activez le fournisseur **Téléphone** (Phone) et **Google**.
2.  **Firestore** : Créez une base de données en mode **Production**.
3.  **Storage** : Créez un bucket de stockage par défaut.
4.  **CORS** : Si vous rencontrez des problèmes d'affichage d'images, configurez le CORS sur votre bucket Storage via Google Cloud Shell :
    ```bash
    gsutil cors set cors.json gs://votre-bucket.appspot.com
    ```
    *cors.json content:*
    ```json
    [{"origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600}]
    ```

### 3. Scripts de Développement

```bash
npm install     # Installation des dépendances
npm run dev     # Lancement du serveur de développement
npm run build   # Build pour la production
```

## 🛠 Architecture

- **Frontend** : React 18 + Vite + TypeScript
- **Styling** : Tailwind CSS + Framer Motion (animations)
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Design** : Recette "Swiss/Modern" (Polices : Inter, Barlow Condensed)

## 📦 Déploiement (Vercel / Netlify)

1. Connectez votre dépôt GitHub.
2. Ajoutez les variables d'environnement.
3. Configurez le build command : `npm run build`.
4. Output directory : `dist`.

---
*Développé avec ❤️ pour la communauté de footballeurs en Tunisie.*
