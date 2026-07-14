# Saison & Terroir

Application mobile de découverte d'activités locales, saison par saison.

L'utilisateur se géolocalise ou saisit une ville, un code postal ou une adresse, choisit une saison, puis obtient une sélection d'activités des environs : nature, culture, gastronomie, sport, bien-être. Chaque activité est présentée avec sa période idéale, son tarif indicatif, ses avis, ses coordonnées de contact et son lien de réservation, et peut être placée sur une carte, mise en favori, annotée ou planifiée dans un agenda.

L'application est disponible en cinq langues (français, anglais, allemand, italien, espagnol), propose un thème sombre par défaut, et **fonctionne intégralement hors ligne**.

---

## Sommaire

- [Fonctionnement hors ligne](#fonctionnement-hors-ligne)
- [Fonctionnalités](#fonctionnalités)
- [Géolocalisation](#géolocalisation)
- [Pile technique](#pile-technique)
- [Installation du projet](#installation-du-projet)
- [Scripts disponibles](#scripts-disponibles)
- [Application Android (APK)](#application-android-apk)
- [Déploiement web](#déploiement-web)
- [État d'avancement](#état-davancement)
- [Données personnelles](#données-personnelles)
- [Structure du projet](#structure-du-projet)
- [Licence](#licence)

---

## Fonctionnement hors ligne

L'application ne dépend d'aucun serveur pour fonctionner. Les activités et les actualités sont calculées localement, sur l'appareil, à partir d'un jeu de données embarqué (`src/data/fallbackData.ts`) et des coordonnées de l'utilisateur. Aucune requête réseau n'est nécessaire pour afficher un résultat.

C'est ce qui permet de la distribuer sous forme d'APK autonome : elle reste pleinement utilisable en randonnée, en zone blanche ou en mode avion.

> **Note sur `server.ts`.** Le dépôt contient encore un serveur Express, hérité d'une version antérieure qui interrogeait l'API Gemini pour générer les activités. **L'application ne l'utilise plus** : aucun fichier de `src/` n'appelle ses routes. Il est conservé pour servir la version web en développement, et comme base si une génération dynamique venait à être réintroduite.

---

## Fonctionnalités

### Recherche et localisation

- Recherche par nom de ville, code postal ou adresse exacte.
- Géolocalisation de l'appareil (voir la section dédiée ci-dessous).
- Rayon de recherche réglable de 5 à 100 km.
- Sélection de la saison : printemps, été, automne, hiver.

### Filtres

- Budget maximum, de 0 à 1000 €.
- Note minimale des avis : toutes, 4.0, 4.5 ou 4.7 étoiles.
- Cinq catégories : Grands Espaces & Nature, Culture & Patrimoine, Gastronomie & Terroir, Sport & Aventures, Bien-être & Détente.

### Activités

Chaque fiche présente la description de l'activité, sa période idéale, son tarif, un comparatif, sa note, le nombre d'avis et un extrait d'avis récent, ainsi qu'un lien de réservation, un téléphone et une adresse e-mail.

### Carte interactive

Les activités trouvées apparaissent sous forme de marqueurs. Cliquer sur un marqueur fait défiler la page jusqu'à la fiche correspondante.

### Favoris et notes privées

Mise en favori par activité, et rédaction d'une note personnelle, protégeable par un verrouillage biométrique.

### Agenda et export calendrier

Calendrier interactif avec planification d'une activité par jour, indicateur météo et alerte en cas de conditions défavorables à une sortie en plein air. Export au format ICS, jour par jour ou pour le mois complet, importable dans l'agenda du téléphone.

### Actualités locales

Fil d'actualité régional filtré par lieu, saison et langue, avec pagination.

### Compte

Onboarding au premier lancement (pseudonyme et autorisation de position), centre de notifications, informations légales et RGPD, formulaire de support.

---

## Géolocalisation

La géolocalisation conditionne l'ensemble des fonctionnalités : c'est elle qui détermine les activités proposées.

Dans une application Android empaquetée avec Capacitor, l'API web `navigator.geolocation` **ne suffit pas**. Deux éléments sont indispensables :

1. Les permissions déclarées dans `android/app/src/main/AndroidManifest.xml` : `ACCESS_FINE_LOCATION` et `ACCESS_COARSE_LOCATION`. Sans elles, l'application n'apparaît **même pas** dans les réglages de position d'Android, et aucune autorisation manuelle n'est possible.
2. Le plugin `@capacitor/geolocation`, seul capable de déclencher la boîte de dialogue système d'autorisation depuis la WebView.

Le module `src/utils/geo.ts` encapsule les deux cas : il utilise le plugin natif dans l'APK, et l'API web du navigateur ailleurs. Il distingue explicitement les causes d'échec (refus simple, refus définitif, délai dépassé, position indisponible) afin d'afficher un message utile plutôt qu'un échec muet.

Le GPS est déclaré non obligatoire : l'application reste installable sur un appareil sans puce GPS, la position approximative suffisant à la recherche.

---

## Pile technique

| Domaine | Technologies |
|---|---|
| Interface | React 19, TypeScript, Vite 6 |
| Style | Tailwind CSS 4 |
| Icônes et animations | lucide-react, motion |
| Cartographie | Leaflet, @vis.gl/react-google-maps |
| Mobile | Capacitor 8 (Android), @capacitor/geolocation |
| Serveur (hérité, non utilisé par l'app) | Express 4, @google/genai |

---

## Installation du projet

Prérequis : Node.js. Pour compiler l'APK, Android Studio (SDK Android et JDK).

```bash
git clone https://github.com/Dow08/Saison-et-Terroir-Application-smartphone.git
cd Saison-et-Terroir-Application-smartphone
npm install
npm run dev
```

---

## Scripts disponibles

| Commande | Effet |
|---|---|
| `npm run dev` | Démarre le serveur de développement. |
| `npm run build` | Compile l'application dans `dist/`. |
| `npm run lint` | Vérifie les types TypeScript sans produire de fichiers. |
| `npx cap sync android` | Reporte le build web et les plugins dans le projet Android. |

---

## Application Android (APK)

L'empaquetage est assuré par Capacitor. L'identifiant de l'application est `com.saisontterroir.app`.

**Toute modification du code web doit être recompilée puis synchronisée avant de reconstruire l'APK**, sans quoi l'APK contiendra l'ancienne version :

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

L'APK signé est produit dans `android/app/build/outputs/apk/release/`.

### Signature

La signature de release est lue depuis `android/keystore.properties`, qui référence un keystore. **Ces deux fichiers ne sont pas versionnés et ne doivent jamais l'être** : ils contiennent la clé de signature et ses mots de passe. Leur perte rend impossible toute mise à jour signée de l'application.

Pour publier une mise à jour, incrémentez `versionCode` et `versionName` dans `android/app/build.gradle`.

### Vérifier les permissions dans l'APK compilé

```bash
aapt dump badging android/app/build/outputs/apk/release/app-release.apk | grep uses-permission
```

`ACCESS_FINE_LOCATION` et `ACCESS_COARSE_LOCATION` doivent apparaître. Dans le cas contraire, la géolocalisation ne fonctionnera pas sur l'appareil.

---

## Déploiement web

L'application ne dépendant plus d'aucune API, `npm run build` produit un dossier `dist/` **entièrement statique**. Il peut être déposé tel quel sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages, Cloudflare Pages), sans serveur Node.

---

## État d'avancement

Le cœur de l'application est fonctionnel : géolocalisation, recherche, filtres, carte, favoris, notes, agenda et export ICS, actualités, multilingue, thème sombre, fonctionnement hors ligne.

Les modules suivants sont implémentés au niveau du parcours utilisateur, avec les intégrations externes prévues dans une prochaine étape :

| Module | État actuel | Étape suivante |
|---|---|---|
| Abonnement premium | Parcours complet et gestion des contenus verrouillés | Branchement d'un prestataire de paiement |
| Authentification biométrique | Parcours de déverrouillage des notes privées | Appel aux capteurs de l'appareil via WebAuthn |
| Notifications push | Centre de notifications et alertes dans l'application | Envoi de notifications système |
| Météo de l'agenda | Indicateurs et alertes de plein air | Branchement d'une API météo |
| Synchronisation multi-appareils | Données conservées localement sur l'appareil | Rétablissement d'une synchronisation serveur |
| Encarts partenaires | Emplacements intégrés à la maquette | Connexion à une régie publicitaire |

---

## Données personnelles

Les données restent sur l'appareil. Sont conservés dans le stockage local : pseudonyme, coordonnées de position, favoris, notes, activités planifiées et préférences. Aucune donnée n'est transmise à un serveur.

La position n'est demandée qu'après une action explicite de l'utilisateur et peut être refusée : la recherche par ville, code postal ou adresse reste alors disponible.

---

## Structure du projet

```
.
├── src/
│   ├── components/
│   │   ├── ActivityCard.tsx            Fiche d'une activité
│   │   ├── BiometricModal.tsx          Déverrouillage biométrique
│   │   ├── InteractiveMap.tsx          Carte et marqueurs
│   │   ├── NotificationCenter.tsx      Centre de notifications
│   │   ├── OnboardingModal.tsx         Premier lancement
│   │   ├── PremiumModal.tsx            Offre premium
│   │   ├── PrivacyModal.tsx            Informations légales et RGPD
│   │   └── UpdateDiagnosticsModal.tsx  Diagnostic de l'application
│   ├── data/
│   │   └── fallbackData.ts             Données embarquées (activités, actualités)
│   ├── utils/
│   │   ├── geo.ts                      Géolocalisation native et web
│   │   └── weather.ts                  Météo de l'agenda
│   ├── App.tsx                         Composant principal
│   ├── main.tsx                        Point d'entrée
│   ├── types.ts                        Types et dictionnaires de traduction
│   └── index.css                       Styles globaux
├── android/                            Projet Android (Capacitor)
├── public/                             Ressources statiques
├── capacitor.config.ts                 Configuration de l'empaquetage mobile
├── server.ts                           Serveur Express hérité, non utilisé par l'app
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Licence

**Tous droits réservés.** Ce projet n'est pas un logiciel libre.

Le code est publié à des fins de consultation, d'évaluation et de démonstration. Toute reproduction, modification, redistribution ou exploitation, commerciale ou non, est interdite sans autorisation écrite préalable de l'auteur. Voir le fichier [LICENSE](LICENSE).
