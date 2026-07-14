import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saisontterroir.app',
  appName: 'Saison et Terroir',
  webDir: 'dist',
  android: {
    /**
     * L'API Overpass (overpass-api.de) rejette par une erreur 406 toute requete
     * portant un User-Agent de navigateur : c'est une protection contre les
     * pages web qui l'interrogeraient massivement. Or une WebView envoie
     * justement celui de Chrome, ce qui rendait le serveur principal
     * inaccessible depuis l'APK.
     *
     * La politique d'usage d'OpenStreetMap demande au contraire un User-Agent
     * identifiant l'application. On le fournit ici : le serveur repond alors
     * normalement, et l'usage devient conforme.
     */
    overrideUserAgent:
      'SaisonTerroir/2.4 (Android; +https://github.com/Dow08/Saison-et-Terroir-Application-smartphone)',
  },
};

export default config;
