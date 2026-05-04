# Pages Overview - Takwira ⚽

This document describes all the pages available in the project, categorized by access levels.

## 🌍 Public Pages
Accessible by all visitors without authentication.

| Page | Route | Description |
| :--- | :--- | :--- |
| **Home** | `/` | The main landing page of the application. |
| **Terrains** | `/terrains` | Listing of available football complexes. |
| **Terrain Detail** | `/terrains/:id` | Detailed view of a specific complex and its fields. |
| **Matches** | `/matches` | Public list of matches looking for players. |
| **Tournaments** | `/tournaments` | Information about upcoming football tournaments. |
| **Academies** | `/academies` | Directory of football schools in Tunisia. |
| **Public Match View** | `/match/:token` | Shareable link for a specific match details. |
| **Connexion / Inscription** | `/connexion` | Authentication portal (Sign In / Sign Up). |
| **Help Center** | `/aide` | FAQs and support documentation. |
| **About Us** | `/a-propos` | Information about the Takwira platform. |
| **Contact** | `/contact` | Contact form for general inquiries. |
| **Blog** | `/blog` | Articles and news about local football. |
| **Blog Detail** | `/blog/:slug` | Full article view. |
| **Terms of Service** | `/terms` | Legal terms and conditions. |
| **Privacy Policy** | `/privacy` | Data protection and privacy information. |
| **Cookie Policy** | `/cookies` | Details about cookie usage on the site. |

---

## 🏃 Player Pages
Accessible by authenticated users (Players).

| Page | Route | Description |
| :--- | :--- | :--- |
| **Profile** | `/profil` | User account settings and historical activity. |
| **Reservation** | `/reserver/:id` | Multi-step booking process for a field. |
| **Create Match** | `/creer-match` | Tool to organize a new match and find players. |
| **My Matches** | `/mes-matchs` | Personal list of joined or created matches. |
| **Match Management** | `/match/:token/manage` | (Creator Only) Manage player lists and match settings. |
| **Manager Onboarding** | `/inscription-gerant` | Process to register a new football complex. |

---

## 🏟️ Manager Dashboard
Accessible by field owners and managers.

| Page | Route | Description |
| :--- | :--- | :--- |
| **Dashboard Home** | `/dashboard` | Overview of daily activities and statistics. |
| **Manage Terrains** | `/dashboard/terrains` | Configure fields, prices, and availability. |
| **Reservations** | `/dashboard/reservations` | View and manage booking schedule. |
| **Recurrences** | `/dashboard/recurrences` | Manage weekly repeat bookings. |
| **Academies** | `/dashboard/academies` | Manage academy programs and students. |
| **Settings** | `/dashboard/parametres` | Complex profile and operational settings. |

---

## 🛠️ Admin Dashboard
Accessible only by platform administrators.

| Page | Route | Description |
| :--- | :--- | :--- |
| **Admin Overview** | `/admin` | Global platform statistics and alerts. |
| **Complexes** | `/admin/complexes` | Verify and manage registered sports complexes. |
| **Users** | `/admin/utilisateurs` | User management and verification. |
| **Reservations** | `/admin/reservations` | Global view of all platform bookings. |
| **Blog CMS** | `/admin/blog` | Manage blog posts (List / Create / Update). |
| **Advertisements** | `/admin/publicites` | Manage hero banners and platform ads. |
| **Global Settings** | `/admin/parametres` | Platform configuration and maintenance mode. |

---

## ⚠️ System Pages

- **404 Not Found**: Shown when a route doesn't exist.
- **Maintenance Page**: Automatically displayed when Global Maintenance mode is active (Admin exclusive access remains).
