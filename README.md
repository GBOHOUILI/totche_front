# Oché – Bénin Tourisme · Frontend

Interface React (Vite) pour la plateforme de gestion des sites touristiques et événements culturels du Bénin.

---

## 🚀 Installation

### 1. Cloner / extraire le projet

```bash
# Si depuis le zip
unzip benin-tourisme-front.zip
cd benin-tourisme
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Éditer `.env` et renseigner l'URL de votre backend Laravel :

```
VITE_API_URL=http://localhost:8000/api
```

### 4. Lancer le backend Laravel

Depuis votre dossier backend :
```bash
cd justin_benin_tourisme_api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 5. Lancer le frontend

```bash
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

---

## 📁 Structure du projet

```
src/
├── api/
│   ├── client.js          ← Axios avec intercepteurs (token Sanctum)
│   └── services.js        ← Tous les appels API (sites, events, auth, admin...)
├── context/
│   └── AuthContext.jsx    ← Auth global (login/logout/register)
├── hooks/
│   └── useFetch.js        ← Hook générique de fetch
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   └── ui/
│       └── index.jsx      ← SiteCard, EventCard, Stars, Spinner, etc.
├── pages/
│   ├── public/
│   │   ├── Home.jsx           ← Accueil avec hero, cards, FAQ
│   │   ├── Sites.jsx          ← Liste sites avec filtres
│   │   ├── SiteDetail.jsx     ← Détail site + galerie + avis + réservation
│   │   ├── Evenements.jsx     ← Liste événements
│   │   ├── EvenementDetail.jsx
│   │   └── AProposContact.jsx ← Pages À Propos + Contact
│   ├── auth/
│   │   └── Auth.jsx           ← Login + Register
│   ├── user/
│   │   ├── Profil.jsx
│   │   └── MesReservations.jsx
│   └── admin/
│       ├── AdminLayout.jsx    ← Sidebar admin
│       ├── Dashboard.jsx
│       ├── AdminSites.jsx     ← CRUD Sites
│       ├── AdminEvenements.jsx ← CRUD + Valider/Rejeter
│       └── AdminUsers.jsx
├── router/
│   └── index.jsx          ← Routes avec protection (RequireAuth, RequireAdmin)
├── App.jsx
├── main.jsx
└── index.css              ← Tous les styles (design Oché)
```

---

## 🔑 Authentification

- Connexion **utilisateur** : `POST /api/login`
- Connexion **admin** : `POST /api/admin/login`
- Le token Sanctum est stocké dans `localStorage` et attaché automatiquement par l'intercepteur Axios
- Accès admin via `/admin` → protégé par `RequireAdmin`

---

## 🎨 Design

- Police display : **Playfair Display**
- Police corps : **DM Sans**
- Couleur principale : **#E63946** (rouge Oché)
- Thème : Minimaliste, professionnel, responsive

---

## 📦 Dépendances principales

| Package | Usage |
|---|---|
| react-router-dom | Navigation SPA |
| axios | Appels API |
| lucide-react | Icônes |
| react-hot-toast | Notifications |
| framer-motion | Animations (disponible) |

---

## ✅ Pages disponibles

| Route | Page |
|---|---|
| `/` | Accueil |
| `/sites` | Liste des sites touristiques |
| `/sites/:id` | Détail d'un site |
| `/evenements` | Liste des événements |
| `/evenements/:id` | Détail d'un événement |
| `/connexion` | Connexion |
| `/inscription` | Inscription |
| `/profil` | Mon profil (auth requis) |
| `/mes-reservations` | Mes réservations (auth requis) |
| `/a-propos` | À Propos |
| `/contacts` | Contact |
| `/admin` | Dashboard admin (admin requis) |
| `/admin/sites` | Gestion sites |
| `/admin/evenements` | Gestion événements |
| `/admin/utilisateurs` | Gestion utilisateurs |

---

**Sen Impact Technologies** · ajustinsena@gmail.com · +229 01 67 75 88 20
