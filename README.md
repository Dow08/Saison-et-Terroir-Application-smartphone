# Saison & Terroir

Application mobile de découverte d'activités locales, saison par saison.

L'utilisateur se géolocalise ou saisit une ville, un code postal ou une adresse, choisit une saison, puis obtient une sélection d'activités des environs : nature, culture, gastronomie, sport, bien-être. Chaque activité est présentée avec sa période idéale, son tarif indicatif, ses avis, ses coordonnées de contact et son lien de réservation, et peut être placée sur une carte, mise en favori, annotée ou planifiée dans un agenda.

L'application est disponible en cinq langues (français, anglais, allemand, italien, espagnol) et propose un thème sombre par défaut.

**Toutes les activités affichées sont réelles.** Elles proviennent d'OpenStreetMap, avec leur nom, leur emplacement et leur distance exacts. L'application n'invente aucune donnée : un champ non renseigné dans OpenStreetMap n'est pas affiché.

---

## Sommaire

- [Sources de données](#sources-de-données)
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

## Sources de données

L'application n'a **ni serveur, ni base de données, ni clé API**. Elle interroge directement deux services publics et gratuits :

| Service | Rôle | Pourquoi celui-ci |
|---|---|---|
| [Photon](https://photon.komoot.io) (Komoot) | Géocodage : convertit une ville, un code postal ou une adresse en coordonnées, et inversement. Couverture mondiale. | Nominatim impose un User-Agent identifiant l'application. Une WebView ne permet pas de définir cet en-tête : Nominatim répond « Access denied » depuis l'APK. Photon n'a pas cette contrainte. |
| [API Overpass](https://overpass-api.de) (OpenStreetMap) | Récupère les lieux réellement répertoriés autour du point de recherche. | Données libres, vérifiables, sans clé. Trois miroirs sont interrogés en repli. |

La position de l'utilisateur sert de biais au géocodage. Sans elle, une saisie comme `31000` est ambiguë à l'échelle mondiale et peut renvoyer un homonyme à l'autre bout de la planète.

### Connexion requise

**L'application a besoin d'une connexion Internet.** C'est un choix assumé : plutôt que d'afficher des activités de démonstration qui donneraient l'illusion d'un résultat, elle affiche un message explicite invitant à se reconnecter. Aucune donnée n'est inventée pour combler une absence de réseau.

Les favoris, en revanche, sont conservés en entier sur l'appareil et restent consultables hors connexion.

### Limites d'usage

Les instances publiques d'Overpass appliquent une limitation de débit. Elles conviennent à un usage personnel ou à une diffusion restreinte. Une adoption à grande échelle imposerait d'héberger sa propre instance ou de passer par un fournisseur.

> **Note sur `server.ts`.** Le dépôt contient encore un serveur Express, hérité d'une version antérieure qui interrogeait l'API Gemini. **L'application ne l'utilise plus** : aucun fichier de `src/` n'appelle ses routes.

---

## Fonctionnalités

### Recherche et localisation

Au démarrage, l'application localise l'utilisateur avec la meilleure précision possible, identifie sa commune, puis charge les activités réellement répertoriées autour de lui.

Il est ensuite possible de rechercher n'importe quel autre lieu dans le monde, par nom de ville, code postal ou adresse : la carte et la liste se recentrent sur le lieu demandé. Un utilisateur à Toulouse peut donc consulter les activités de Paris.

Le rayon de recherche est réglable de 5 à 100 km.

### Activités

Chaque fiche affiche **uniquement ce qu'OpenStreetMap contient réellement** :

- le nom du lieu et son type (musée, château, cascade, domaine viticole…) ;
- sa **distance exacte** depuis le point de recherche, calculée par la formule de Haversine ;
- son tarif, lorsqu'il est renseigné (tags `fee` et `charge`) ;
- ses horaires, son adresse, son téléphone, son site officiel, lorsqu'ils existent ;
- un lien vers Google Maps, pour consulter les **vrais avis** du lieu ;
- un lien vers sa fiche OpenStreetMap, pour vérifier la source.

Un champ absent d'OpenStreetMap n'est pas affiché. Aucune valeur n'est inventée pour combler un vide.

Les résultats peuvent être nombreux (plusieurs centaines en zone urbaine) : ils sont triés par distance et paginés.

### Filtres

- **Tarif** : gratuit, payant, ou tous. Ce filtre s'appuie sur les tags OpenStreetMap, pas sur une estimation.
- **Catégorie** : Nature, Culture, Gastronomie, Sport, Bien-être.
- **Saison** : la saison **réordonne** les suggestions (l'extérieur remonte en été, l'intérieur en hiver). Elle ne filtre pas les lieux, OpenStreetMap ne connaissant pas leur saisonnalité.

### Carte interactive

Les activités trouvées apparaissent sous forme de marqueurs. Cliquer sur un marqueur fait défiler la page jusqu'à la fiche correspondante.

### Favoris et notes privées

Mise en favori par activité, et rédaction d'une note personnelle, protégeable par un verrouillage biométrique. La fiche complète du favori est conservée sur l'appareil : elle reste accessible même après un changement de ville ou hors connexion, et sa distance est recalculée depuis la position courante.

### Agenda et export calendrier

Calendrier interactif avec planification d'une activité par jour, indicateur météo et alerte en cas de conditions défavorables à une sortie en plein air. Export au format ICS, jour par jour ou pour le mois complet, importable dans l'agenda du téléphone.

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

`npm run build` produit un dossier `dist/` **entièrement statique** : l'application appelle Photon et Overpass directement depuis le navigateur, sans backend. Le dossier peut donc être déposé tel quel sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages, Cloudflare Pages), sans serveur Node.

---

## État d'avancement

Le cœur de l'application est fonctionnel et repose sur des données réelles : géolocalisation précise, géocodage mondial, activités OpenStreetMap avec distances exactes, filtres, carte, pagination, favoris persistants, notes, agenda et export ICS, multilingue, thème sombre.

Les modules suivants sont implémentés au niveau du parcours utilisateur, avec les intégrations externes prévues dans une prochaine étape :

| Module | État actuel | Étape suivante |
|---|---|---|
| Abonnement premium | Parcours complet et gestion des contenus verrouillés | Branchement d'un prestataire de paiement |
| Authentification biométrique | Parcours de déverrouillage des notes privées | Appel aux capteurs de l'appareil via WebAuthn |
| Notifications push | Centre de notifications et alertes dans l'application | Envoi de notifications système |
| Météo de l'agenda | Indicateurs et alertes de plein air | Branchement d'une API météo |
| Synchronisation multi-appareils | Données conservées localement sur l'appareil | Rétablissement d'une synchronisation serveur |

---

## Données personnelles

Aucune donnée personnelle n'est envoyée à un serveur de l'application, qui n'en possède aucun.

Restent sur l'appareil, dans le stockage local : pseudonyme, coordonnées de position, favoris (fiches complètes), notes privées, activités planifiées et préférences.

Sont transmis à des services tiers, le temps d'afficher un résultat :

- à **Photon (Komoot)** : le lieu recherché, ou les coordonnées à convertir en nom de commune ;
- à l'**API Overpass (OpenStreetMap)** : les coordonnées du point de recherche et le rayon.

Ces requêtes contiennent la zone recherchée, jamais l'identité de l'utilisateur.

La position n'est demandée qu'après une action explicite et peut être refusée : la recherche par ville, code postal ou adresse reste alors disponible.

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
│   ├── services/
│   │   ├── geocoding.ts                Géocodage mondial via Photon
│   │   └── overpass.ts                 Activités réelles via OpenStreetMap
│   ├── data/
│   │   └── fallbackData.ts             Notification de bienvenue, infos de version
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
