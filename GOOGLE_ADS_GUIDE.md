# Manuel d'intégration Google Ads & AdSense - Takwira

Ce guide explique comment configurer les identifiants publicitaires nécessaires pour le fonctionnement de l'application. Tous les identifiants doivent être ajoutés en tant que variables d'environnement (dans votre fichier `.env` ou dans les paramètres de la plateforme).

## 1. Google AdSense

L'intégration AdSense est hybride : elle affiche des annonces Google si elles sont disponibles et validées, sinon elle se replie sur les annonces personnalisées "Takwira" stockées dans Firestore.

### Où trouver le Publisher ID (`VITE_ADSENSE_PUBLISHER_ID`)
1. Connectez-vous à votre [compte Google AdSense](https://www.google.com/adsense/).
2. Allez dans **Compte** > **Paramètres** > **Informations sur le compte**.
3. Copiez l'**Identifiant de l'éditeur** (format : `ca-pub-XXXXXXXXXXXXXXXX`).

### Où trouver les Slot IDs (Annonces individuelles)
Pour chaque position, vous devez créer un "Bloc d'annonces" (Ad Unit) de type "Annonces display" :
1. Allez dans **Annonces** > **Par bloc d'annonces**.
2. Créez des blocs pour les positions suivantes :
   - **`VITE_ADSENSE_SLOT_BLOG_LIST`** : Utilisez un format "Horizontal" ou "Adaptatif".
   - **`VITE_ADSENSE_SLOT_SIDEBAR_TOP`** : Utilisez un format "Rectangle" (ex: 300x250).
   - **`VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM`** : Utilisez un format "Rectangle" (ex: 300x250).
   - **`VITE_ADSENSE_SLOT_INLINE`** : Utilisez un format "Adaptatif" pour l'insertion dans les articles.
3. Une fois créé, cliquez sur l'icône de code (`<>`) et récupérez la valeur de `data-ad-slot` (un numéro à 10 chiffres).

**Note importante :** Votre site doit être ajouté et validé dans l'onglet **Sites** d'AdSense pour que les publicités s'affichent réellement.

---

## 2. Google Ads (Conversion Tracking)

Le suivi des conversions permet de mesurer l'efficacité de vos campagnes publicitaires (ex: combien d'utilisateurs ont réservé après avoir cliqué sur une pub).

### Où trouver le Google Ads ID (`VITE_GOOGLE_ADS_ID`)
1. Connectez-vous à votre [compte Google Ads](https://ads.google.com/).
2. Cliquez sur l'icône **Outils et paramètres** > **Configuration** > **Tag Google**.
3. L'identifiant se trouve dans l'onglet "Installation" (format : `AW-XXXXXXXXXX`).

### Configurer les Actions de Conversion
Le code est configuré pour envoyer 4 événements spécifiques. Vous devez les créer manuellement dans l'interface Google Ads :
1. Allez dans **Objectifs** > **Conversions** > **Récapitulatif**.
2. Cliquez sur **Nouvelle action de conversion** > **Site Web**.
3. Créez des actions avec les noms correspondants (ou mappez-les via le Tag Manager) :
   - `reservation_submitted` : Déclenché lors d'une réservation de terrain réussie.
   - `match_created` : Déclenché lorsqu'un organisateur crée un match.
   - `manager_signup` : Déclenché lors de la finalisation du formulaire "Complexe".
   - `player_checkin` : Déclenché lorsqu'un joueur rejoint un match sur la page publique.

---

## 3. Récapitulatif des Variables d'Environnement

Ajoutez ceci à votre configuration :

```env
# Google AdSense
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_BLOG_LIST=1234567890
VITE_ADSENSE_SLOT_SIDEBAR_TOP=1234567890
VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM=1234567890
VITE_ADSENSE_SLOT_INLINE=1234567890

# Google Ads
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
```

## 4. Respect de la Vie Privée (Consentement)

Le système a été conçu pour être conforme au RGPD :
- Les scripts AdSense et Google Ads ne sont **chargés dynamiquement** que si l'utilisateur accepte les "Cookies Publicitaires" dans le bandeau de consentement.
- Si le consentement est refusé, un espace neutre est affiché à la place des publicités pour maintenir la mise en page.
