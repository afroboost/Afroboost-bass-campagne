# Afroboost - Product Requirements Document

## Original Problem Statement
Application de réservation de casques audio pour des cours de fitness Afroboost. Design sombre néon avec fond noir pur (#000000) et accents rose/violet.

## User Personas
- **Utilisateurs**: Participants aux cours de fitness qui réservent des casques audio
- **Coach**: Administrateur qui gère les cours, offres, réservations, codes promo et campagnes marketing

## Core Requirements

### Système de Réservation
- [x] Sélection de cours et dates
- [x] Choix d'offres (Cours à l'unité, Carte 10 cours, Abonnement)
- [x] Formulaire d'information utilisateur (Nom, Email, WhatsApp)
- [x] Application de codes promo avec validation en temps réel
- [x] Liens de paiement (Stripe, PayPal, Twint)
- [x] Confirmation de réservation avec code unique

### Mode Coach Secret
- [x] Accès par 3 clics rapides sur le copyright
- [x] Login avec credentials (coach@afroboost.com / afroboost123)
- [x] Tableau de bord avec 7 onglets (Réservations, Concept, Cours, Offres, Paiements, Codes promo, Campagnes)

### Administration (Mode Coach)
- [x] **Réservations**: Tableau complet avec export CSV
- [x] **Concept & Visuel**: 
  - Description du concept (textarea)
  - URL Média 16:9 (YouTube/Vimeo/Image)
  - URL du Logo (Splash Screen & PWA)
  - URL du Favicon
- [x] **Cours**: CRUD complet avec jour, heure, lieu, lien Maps, toggle visibilité
- [x] **Offres**: 
  - Nom, Prix, URL miniature, Visible
  - Description pour icône "i" (max 150 caractères)
- [x] **Paiements**: Configuration liens Stripe/PayPal/Twint, WhatsApp Coach
- [x] **Codes Promo**: 
  - Création avec type (100%, %, CHF), valeur, bénéficiaire
  - Liste cours autorisés avec scroll
  - Bouton supprimer (poubelle rouge)
  - Import CSV
- [x] **📢 Campagnes Marketing** (NOUVEAU):
  - Création de campagnes multi-canaux (WhatsApp, Email, Instagram)
  - Programmation multi-dates (chaque date = ligne distincte)
  - Sélection de contacts ciblés
  - Aperçu visuel du média
  - Lancement et suivi des envois
  - Indicateurs d'erreur visuels (point rouge pour numéros invalides)

### Internationalisation (i18n)
- [x] FR, EN, DE
- [x] Changement instantané via icône globe

### Design
- [x] Fond noir pur (#000000)
- [x] Bordures néon rose/violet
- [x] Effets de lueur
- [x] Bouton paiement avec dégradé pulsant

---

## What's Been Implemented (Jan 2026)

### Module Gestionnaire de Campagnes (13 Jan 2026)
1. ✅ **Création de campagnes marketing**:
   - Formulaire complet: nom, message avec variables {prénom}, URL média, format (9:16/16:9)
   - Canaux d'envoi: WhatsApp, Email, Instagram
   - Ciblage: Tous les contacts ou sélection individuelle
   
2. ✅ **Programmation multi-dates**:
   - Option "Programmer (multi-dates)" avec ajout/suppression de créneaux
   - Chaque date crée une campagne distincte avec statut "Programmé"
   - Calendrier avec restriction aux dates futures
   
3. ✅ **Génération de liens WhatsApp optimisée**:
   - Format: `https://api.whatsapp.com/send?phone=41XXXXXXXXX&text=...`
   - Nettoyage automatique des numéros suisses (0765203363 → 41765203363)
   - URL du média à la fin du message (active l'aperçu WhatsApp)
   
4. ✅ **Indicateurs d'erreur visuels**:
   - Point rouge 🔴 pour numéros invalides ou emails manquants
   - Panel d'erreurs récentes en haut de l'historique
   - Message "⚠️ Certains contacts ont des informations manquantes"
   
5. ✅ **Historique des campagnes**:
   - Tableau avec colonnes: Campagne, Contacts, Canaux, Statut, Date, Actions
   - Statuts: Brouillon, Programmé, En cours, Envoyé
   - Détails d'envoi expandables avec progression

### Corrections techniques précédentes (13 Jan 2026)
1. ✅ **Lecteur vidéo étanche 16:9**
2. ✅ **Description du concept dynamique**
3. ✅ **Favicon & Logo dynamique**
4. ✅ **Codes promo robustes** (insensible à la casse, espaces, mise à jour temps réel)

### Tests
- Backend: 31/31 tests passés (pytest)
- Frontend: Toutes les fonctionnalités vérifiées
- Tests spécifiques campagnes: 8/8 passés

### Corrections Bug Fixes (15 Jan 2026)
1. ✅ **Scanner QR amélioré**:
   - Test direct de la caméra avant initialisation html5-qrcode
   - Indicateur de chargement pendant l'initialisation
   - Messages d'erreur plus clairs avec bouton "Réessayer"
   - Fallback robuste vers saisie manuelle
   
2. ✅ **Icône "i" sur les offres**:
   - Cercle rose visible sur les offres avec descriptions
   - Panneau de description s'affiche au clic
   - Bouton de fermeture (×) pour revenir à l'image

3. ✅ **Badges de statut**:
   - "✅ Validé" avec fond vert
   - "⏳ En attente" avec fond jaune
   - Affichés dans le tableau des réservations

4. ✅ **Slider horizontal des offres - SWIPE FLUIDE (corrigé)**:
   - CSS optimisé avec `-webkit-overflow-scrolling: touch !important`
   - `touch-action: pan-x` pour swipe mobile
   - `scroll-snap-type: x mandatory` pour arrêt net sur chaque carte
   - Suppression des styles inline conflictuels
   - Effet LED néon rose (#d91cd2) sur l'offre sélectionnée
   - Badge "✓ Sélectionné" visible

5. ✅ **Affichage images des offres (corrigé)**:
   - Priorité: `offer.images[0] > offer.thumbnail > defaultImage`
   - Points de navigation discrets pour cartes multi-images
   - Carrousel avec navigation au clic sur les points
   - Zoom modal avec flèches de navigation
   - Synchronisation correcte après édition coach (`fetchData()` appelé au retour)

6. ✅ **Cartes non tronquées (corrigé)**:
   - `.offer-card.selected { height: auto !important; max-height: none !important; }`
   - Conteneur flexible qui s'adapte au contenu

7. ✅ **Rich Preview (Open Graph)**:
   - Meta tags og:title, og:description, og:image ajoutés
   - Image og-image.png générée (1.3MB)
   - Twitter Card meta tags ajoutés
   - Aperçu riche pour partage WhatsApp/Instagram

### Refactoring Modulaire Vercel P1 (15 Jan 2026)
1. ✅ **Composants extraits de App.js**:
   - `/components/OfferCard.js` - OfferCard + OfferCardSlider avec multi-images
   - `/components/QRScanner.js` - Modal scanner avec gestion propre caméra (stop/start)
   - `/components/AdminCampaigns.js` - Hooks + composants pour campagnes marketing
   - `/components/index.js` - Export centralisé de tous les composants

2. ✅ **CSS organisé par sections**:
   - Section "OFFERS SLIDER STYLES" - Swipe mobile iOS/Android
   - Section "QR SCANNER STYLES" - Conteneur visible
   - Section "OFFER CARD STYLES" - Multi-images et sélection
   - Section "COACH MODE ADMIN STYLES" - Tabs coach
   - Section "CAMPAIGNS STYLES" - Gestionnaire marketing

3. ✅ **Vérifications post-refactoring**:
   - Bouton "Voir les avis" : Fonctionnel ✓
   - Champ adresse conditionnel (produits) : Fonctionnel ✓
   - Scanner QR : Modal + boutons fonctionnels ✓
   - Swipe offres mobile : Fonctionnel ✓

### Fonctionnalités Avis Google (15 Jan 2026)
1. ✅ **Mode Coach - Champ Lien des avis Google**:
   - Onglet "Concept & Visuel" - nouveau champ `googleReviewsUrl`
   - Indicateur visuel "✓ Lien configuré" en vert
   - Lien "Tester le lien" pour prévisualisation
   - Persistance via API `/api/concept`

2. ✅ **Mode Client - Bouton "Voir les avis"**:
   - Positionné entre offres et formulaire
   - Design néon transparent avec bordure lumineuse rose/violet
   - Icône étoile + icône lien externe
   - Ouvre le lien Google dans un nouvel onglet
   - Masqué si aucun lien configuré

### Intégration EmailJS (15 Jan 2026)
1. ✅ **Service EmailJS créé**:
   - `/services/emailService.js` - Envoi automatisé avec @emailjs/browser
   - Fonctions: `sendEmail`, `sendBulkEmails`, `testEmailJSConfig`
   - Stockage config dans localStorage (pas de backend)

2. ✅ **Interface Admin EmailJS**:
   - Panneau de configuration avec 3 champs (Service ID, Template ID, Public Key)
   - Bouton "💾 Sauvegarder" + "🧪 Tester" avec email de test
   - Instructions pour créer un template EmailJS
   - Indicateur "✅ Configuré" / "⚠️ Non configuré"

3. ✅ **Envoi automatique avec progression**:
   - Barre de progression "Envoi en cours : X/Total"
   - Affichage du nom du contact en cours d'envoi
   - Récapitulatif final "X envoyés / X échecs"
   - Délai de 200ms entre les envois (anti rate-limiting)

4. ✅ **Fallback conservé**:
   - Lien "📧 Ouvrir client email (BCC)" toujours disponible

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py       # FastAPI avec données en mémoire
│   ├── requirements.txt
│   └── tests/
│       ├── test_afroboost_api.py
│       └── test_campaigns_api.py
└── frontend/
    ├── src/
    │   ├── App.js      # Composant React principal (~3600 lignes)
    │   ├── App.css     # Styles néon organisés par sections
    │   ├── config/
    │   │   ├── index.js      # Configuration groupée
    │   │   └── constants.js  # Constantes exportées
    │   ├── services/
    │   │   ├── index.js          # Export centralisé services (NOUVEAU)
    │   │   └── emailService.js   # EmailJS automatisé (NOUVEAU)
    │   ├── components/
    │   │   ├── index.js          # Export centralisé
    │   │   ├── OfferCard.js      # Composants offres + multi-images
    │   │   ├── QRScanner.js      # Scanner QR avec gestion caméra
    │   │   ├── AdminCampaigns.js # Hooks + composants campagnes
    │   │   ├── LanguageSelector.jsx
    │   │   └── ui/
    │   │       └── index.jsx     # Composants UI de base
    │   ├── hooks/
    │   │   └── index.js      # Hooks personnalisés
    │   └── utils/
    │       └── i18n.js       # Internationalisation
    ├── vercel.json           # Configuration déploiement Vercel
    ├── ARCHITECTURE.md       # Documentation structure
    └── public/
        ├── index.html  # PWA meta tags + Open Graph
        └── manifest.json
```

### Data Models (MongoDB)
- `courses`: id, name, weekday, time, locationName, mapsUrl, visible
- `offers`: id, name, price, thumbnail, description, visible
- `users`: id, name, email, whatsapp, createdAt
- `reservations`: id, reservationCode, userId, userName, userEmail, courseId, ...
- `discount_codes`: id, code, type, value, assignedEmail, courses, maxUses, used, active
- `concept`: id, description, heroImageUrl, logoUrl, faviconUrl
- `payment_links`: id, stripe, paypal, twint, coachWhatsapp
- `campaigns`: id, name, message, mediaUrl, mediaFormat, targetType, selectedContacts, channels, scheduledAt, status, results, createdAt

---

## Prioritized Backlog

### P0 - Completed ✅
- [x] Module Gestionnaire de Campagnes complet
- [x] Envoi WhatsApp avec aperçu média
- [x] Programmation multi-dates
- [x] Indicateurs d'erreur visuels
- [x] Swipe fluide des offres (mobile)
- [x] Affichage correct des images d'offres
- [x] Cartes non tronquées
- [x] Architecture config Vercel initiée
- [x] Bouton "Voir les avis Google" côté client
- [x] Champ "Lien des avis Google" dans Mode Coach
- [x] Gestionnaire de Campagnes opérationnel (Email BCC, WhatsApp nav, Instagram DM)

### P1 - À faire
- [ ] Continuer refactoring: Extraire CoachDashboard, CoachLoginModal dans composants séparés
- [ ] Migration vers vraie persistance MongoDB (actuellement données en mémoire)
- [ ] Tests automatisés pour les composants extraits

### P2 - Backlog
- [ ] Créer pages dédiées: /boutique, /profil (routing Vercel)
- [ ] Envoi Email via mailto: avec sujet personnalisé
- [ ] Envoi Instagram via ig.me
- [ ] Notifications email après réservation
- [ ] Dashboard analytics pour le coach

---

## Credentials
- **Coach Login**: coach@afroboost.com / afroboost123
- **Coach Access**: 3 clics rapides sur "© Afroboost 2026"

---

## Known Limitations
⚠️ **DONNÉES NON PERSISTANTES**: Le backend utilise actuellement des listes en mémoire. Toutes les données sont perdues au redémarrage du serveur. La migration vers MongoDB est prioritaire pour la production.
