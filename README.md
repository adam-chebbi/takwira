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

## 📦 Déploiement sur Vercel

Pour déployer Takwira sur Vercel, suivez ces étapes :

1.  Connectez votre dépôt GitHub à un nouveau projet Vercel.
2.  Dans les **Environment Variables**, ajoutez toutes les variables listées ci-dessous.
3.  Vercel utilisera automatiquement la configuration du fichier `vercel.json` présent à la racine pour gérer le routage SPA et les en-têtes de sécurité.

### Variables d'Environnement Obligatoires

| Variable | Description | Source |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Clé API de votre projet Firebase | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification Firebase | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_PROJECT_ID` | ID unique de votre projet Firebase | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_STORAGE_BUCKET` | URL du bucket de stockage | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Identifiant d'envoi de messages | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_APP_ID` | Identifiant unique de l'application | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_MEASUREMENT_ID` | ID de mesure (Analytics) | Console Firebase > Paramètres du projet |
| `VITE_FIREBASE_DATABASE_ID` | ID de la base Firestore (souvent `(default)`) | Console Firebase > Firestore |
| `VITE_ADSENSE_PUBLISHER_ID` | Votre identifiant Google AdSense | Dashboard Google AdSense (`ca-pub-XXX`) |
| `VITE_ADSENSE_SLOT_BLOG_LIST` | ID de l'emplacement pub liste blog | Dashboard Google AdSense |
| `VITE_ADSENSE_SLOT_SIDEBAR_TOP` | ID de l'emplacement pub barre latérale haut | Dashboard Google AdSense |
| `VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM` | ID de l'emplacement pub barre latérale bas | Dashboard Google AdSense |
| `VITE_ADSENSE_SLOT_INLINE` | ID de l'emplacement pub dans le contenu | Dashboard Google AdSense |
| `VITE_GOOGLE_ADS_ID` | ID de suivi Google Ads | Dashboard Google Ads (`AW-XXX`) |

> **Note :** La variable `GEMINI_API_KEY` n'est pas requise en production car elle est spécifique à l'environnement de développement AI Studio.

## 🚀 CI/CD avec GitHub Actions

Le projet est configuré avec un pipeline automatisé qui valide le code et déploie sur Vercel à chaque modification.

### Configuration Ponctuelle (Setup)

1.  Installez la CLI Vercel : `npm install -g vercel`
2.  Connectez-vous : `vercel login`
3.  Liez le projet : `vercel link` (ID de l'organisation et du projet seront générés dans `.vercel/project.json`)
4.  Commitez le fichier `.vercel/project.json` (il ne contient pas de secrets).

### Secrets GitHub Requis

Dans les **Settings > Secrets and Variables > Actions** de votre dépôt GitHub, ajoutez les secrets suivants :

*   `VERCEL_TOKEN` : Créé dans [Vercel Tokens](https://vercel.com/account/tokens).
*   `VERCEL_ORG_ID` : Trouvé dans `.vercel/project.json`.
*   `VERCEL_PROJECT_ID` : Trouvé dans `.vercel/project.json`.
*   **Toutes les variables VITE_*** listées dans le tableau précédent.

Une fois configuré, chaque push sur `main` déploiera automatiquement sur `takwira.vercel.app`.

---
*Développé avec ❤️ pour la communauté de footballeurs en Tunisie.*
