# Saison & Terroir

Application mobile de découverte d'activités locales, saison par saison.

L'utilisateur indique une ville, un code postal, une adresse ou se géolocalise, choisit une saison, puis reçoit une sélection d'activités des environs : nature, culture, gastronomie, sport, bien-être. Chaque activité est présentée avec sa période idéale, son tarif indicatif, ses avis Google, ses coordonnées de contact et son lien de réservation, et peut être placée sur une carte, mise en favori, annotée ou planifiée dans un agenda.

L'application est disponible en cinq langues (français, anglais, allemand, italien, espagnol) et propose un thème sombre par défaut.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Pile technique](#pile-technique)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [API du serveur](#api-du-serveur)
- [Déploiement](#déploiement)
- [Fonctions simulées](#fonctions-simulées)
- [Données personnelles](#données-personnelles)
- [Structure du projet](#structure-du-projet)

---

## Fonctionnalités

### Recherche et géolocalisation

- Recherche par nom de ville, code postal ou adresse exacte.
- Bouton de géolocalisation utilisant la position du navigateur.
- Rayon de recherche réglable de 5 à 100 km (20 km par défaut).
- Sélection de la saison : printemps, été, automne, hiver. Le changement de saison relance automatiquement la recherche.

### Filtres avancés

- Budget maximum réglable de 0 à 1000 € (affiche « Gratuit » ou « Sans limite » aux extrêmes).
- Note minimale des avis clients : toutes, 4.0, 4.5 ou 4.7 étoiles.
- Cinq catégories d'activités : Grands Espaces & Nature, Culture & Patrimoine, Gastronomie & Terroir, Sport & Aventures, Bien-être & Détente.

### Fiches d'activité

Chaque activité affiche son nom, sa catégorie, sa description, sa période idéale, son tarif indicatif, un comparatif, ainsi que sa note Google, le nombre d'avis et un extrait d'avis récent. Un lien de réservation, un numéro de téléphone et une adresse e-mail sont proposés pour le contact direct.

### Carte interactive

Les activités trouvées sont affichées sous forme de marqueurs sur une carte. Cliquer sur un marqueur fait défiler la page jusqu'à la fiche correspondante.

### Favoris et notes privées

- Ajout et retrait d'une activité en favori via l'icône en forme de cœur.
- Rédaction d'une note personnelle par activité (mémo de réservation, heure d'arrivée, etc.).
- Les notes peuvent être protégées par un verrouillage biométrique.

### Agenda et export calendrier

- Calendrier interactif du mois de juillet 2026.
- Planification d'une activité sur un jour donné.
- Indicateur météo par jour, avec une alerte visuelle quand les conditions sont défavorables à une activité de plein air.
- Export au format ICS, jour par jour ou pour le mois complet, importable dans l'agenda du téléphone.

### Actualités locales

Fil d'actualité régional filtré par lieu, saison et langue, avec pagination. Chaque entrée affiche un titre, un résumé, une catégorie, une date de publication et un lien vers la source.

### Compte et synchronisation

- Onboarding au premier lancement : choix d'un pseudonyme et autorisation de géolocalisation.
- Identifiant utilisateur généré automatiquement, servant de code de synchronisation.
- Synchronisation entre appareils des favoris, du statut premium, des notifications, des notes et du réglage biométrique.

### Notifications

Centre de notifications listant les alertes reçues, avec distinction lu / non lu et bannière d'affichage en haut de l'écran.

### Interface

- Thème sombre et thème clair.
- Changement de langue à la volée, qui relance la recherche dans la langue choisie.
- Modale d'informations légales et RGPD.
- Formulaire de contact au support.
- Emplacements publicitaires et encarts partenaires.

---

## Architecture

L'application est une application « full-stack » : une interface React servie par un serveur Express, tous deux démarrés depuis le même projet.

Point important : **les appels au modèle Gemini sont effectués côté serveur**, jamais depuis le navigateur. La clé API reste donc sur le serveur et n'est pas exposée aux utilisateurs. Le client ne dialogue qu'avec les routes `/api/...` du serveur.

En l'absence de clé API valide, le serveur bascule automatiquement sur un jeu de données de démonstration afin que l'application reste utilisable.

---

## Pile technique

| Domaine | Technologies |
|---|---|
| Interface | React 19, TypeScript, Vite 6 |
| Style | Tailwind CSS 4 |
| Icônes et animations | lucide-react, motion |
| Cartographie | Leaflet, @vis.gl/react-google-maps |
| Serveur | Express 4, tsx (développement), esbuild (production) |
| IA | @google/genai (Gemini, appelé côté serveur) |

---

## Installation

Prérequis : Node.js.

```bash
git clone https://github.com/Dow08/Saison-et-Terroir-Application-smartphone.git
cd Saison-et-Terroir-Application-smartphone
npm install
```

Créez ensuite un fichier `.env.local` à la racine (voir `.env.example`) :

```
GEMINI_API_KEY=votre_cle_api
```

Puis lancez l'application :

```bash
npm run dev
```

---

## Variables d'environnement

| Variable | Rôle | Obligatoire |
|---|---|---|
| `GEMINI_API_KEY` | Clé de l'API Google Gemini, utilisée côté serveur pour générer les activités et les actualités. | Non, mais sans elle l'application fonctionne en mode démonstration avec des données fixes. |

Le fichier `.env.local` ne doit jamais être versionné.

---

## Scripts disponibles

| Commande | Effet |
|---|---|
| `npm run dev` | Démarre le serveur de développement. |
| `npm run build` | Compile l'interface avec Vite et le serveur avec esbuild vers `dist/`. |
| `npm start` | Démarre le serveur compilé (`dist/server.cjs`). |
| `npm run lint` | Vérifie les types TypeScript sans produire de fichiers. |
| `npm run clean` | Supprime les fichiers de build. |

---

## API du serveur

| Route | Méthode | Rôle |
|---|---|---|
| `/api/activities` | POST | Renvoie les activités correspondant au lieu, à la saison et aux filtres. |
| `/api/news` | GET | Renvoie les actualités régionales, paginées. |
| `/api/sync/:userId` | GET | Récupère les données de l'utilisateur. |
| `/api/sync/save` | POST | Enregistre les préférences de l'utilisateur. |
| `/api/sync/trigger-notification` | POST | Déclenche une notification. |
| `/api/build-info` | GET | Renvoie la version et des informations de diagnostic. |

---

## Déploiement

Cette application **nécessite un hébergeur capable d'exécuter Node.js**. Elle ne peut pas être déployée sur un hébergement purement statique : l'interface s'afficherait, mais toutes les routes `/api/...` renverraient une erreur et aucune activité ne serait trouvée.

Hébergeurs adaptés : Google Cloud Run, Render, Railway, Fly.io, ou toute plateforme acceptant un serveur Node.

Procédure :

```bash
npm run build
npm start
```

Le serveur écoute alors les requêtes et sert les fichiers compilés. Pensez à définir `GEMINI_API_KEY` dans les variables d'environnement de l'hébergeur.

---

## État d'avancement

Le cœur de l'application est fonctionnel : recherche géolocalisée, génération des activités par Gemini, filtres, carte, favoris, notes, agenda et export ICS, actualités, multilingue, synchronisation.

Les modules suivants sont aujourd'hui implémentés au niveau du parcours utilisateur, avec les intégrations externes prévues dans une prochaine étape :

| Module | État actuel | Étape suivante |
|---|---|---|
| Abonnement premium | Parcours complet et gestion des contenus verrouillés | Branchement d'un prestataire de paiement |
| Authentification biométrique | Parcours de déverrouillage des notes privées | Appel aux capteurs de l'appareil via WebAuthn |
| Notifications push | Centre de notifications et alertes dans l'application | Envoi de notifications système |
| Météo de l'agenda | Indicateurs et alertes de plein air | Branchement d'une API météo |
| Encarts partenaires | Emplacements intégrés à la maquette | Connexion à une régie publicitaire |

---

## Données personnelles

Les données suivantes sont conservées dans le stockage local du navigateur : pseudonyme, coordonnées de géolocalisation, activités planifiées, état de l'onboarding. Les favoris, notes et préférences peuvent en outre être synchronisés vers le serveur via le code de synchronisation.

La géolocalisation n'est activée qu'après accord explicite de l'utilisateur et peut être refusée : la recherche par ville, code postal ou adresse reste alors disponible.

---

## Structure du projet

```
.
├── src/
│   ├── components/
│   │   ├── ActivityCard.tsx            Fiche d'une activité
│   │   ├── BiometricModal.tsx          Modale de déverrouillage biométrique
│   │   ├── InteractiveMap.tsx          Carte et marqueurs
│   │   ├── NotificationCenter.tsx      Centre de notifications
│   │   ├── OnboardingModal.tsx         Premier lancement
│   │   ├── PremiumModal.tsx            Présentation de l'offre premium
│   │   ├── PrivacyModal.tsx            Informations légales et RGPD
│   │   └── UpdateDiagnosticsModal.tsx  Diagnostic de l'application
│   ├── utils/                          Fonctions utilitaires
│   ├── App.tsx                         Composant principal et logique de l'app
│   ├── main.tsx                        Point d'entrée
│   ├── types.ts                        Types et dictionnaires de traduction
│   └── index.css                       Styles globaux
├── public/                             Ressources statiques
├── server.ts                           Serveur Express et appels Gemini
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Licence

**Tous droits réservés.** Ce projet n'est pas un logiciel libre.

Le code est publié à des fins de consultation, d'évaluation et de démonstration. Toute reproduction, modification, redistribution ou exploitation, commerciale ou non, est interdite sans autorisation écrite préalable de l'auteur. Voir le fichier [LICENSE](LICENSE).
