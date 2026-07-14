/**
 * Geocodage reel, couverture mondiale, gratuit et sans cle API.
 *
 * Fournisseur : Photon (Komoot), bati sur les donnees OpenStreetMap.
 *
 * Pourquoi pas Nominatim ? Sa politique d'usage impose un User-Agent
 * identifiant l'application. Or une WebView (donc l'APK) ne permet pas de
 * definir cet en-tete : Nominatim repond alors "Access denied". Photon
 * n'impose pas cette contrainte et convient a un client embarque.
 *
 * Regle : si le lieu n'est pas trouve, on le dit. Aucune position inventee.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  /** Libelle court affichable : "Toulouse, Occitanie" */
  label: string;
}

const PHOTON = "https://photon.komoot.io";

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

interface PhotonProperties {
  name?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

function buildLabel(p: PhotonProperties): string {
  const place = p.city || p.town || p.village || p.name || p.county;
  const region = p.state || p.county;
  return [place, region && region !== place ? region : null].filter(Boolean).join(", ");
}

async function callPhoton(path: string): Promise<any> {
  let res: Response;
  try {
    // Delai maximal : sans lui, une requete sans reponse bloquerait
    // indefiniment l'indicateur de chargement.
    res = await fetch(`${PHOTON}${path}`, { signal: AbortSignal.timeout(15000) });
  } catch {
    throw new NetworkError("Impossible de joindre le service de localisation.");
  }
  if (!res.ok) {
    throw new NetworkError(`Service de localisation indisponible (${res.status}).`);
  }
  return res.json();
}

/**
 * Convertit une saisie libre (ville, code postal, adresse) en coordonnees reelles.
 *
 * @param bias position connue de l'utilisateur, utilisee pour lever les
 *   ambiguites. Sans elle, une saisie comme "31000" est mondiale : Photon
 *   renvoyait un lieu en Thailande au lieu de Toulouse. Le biais fait remonter
 *   les resultats proches de l'utilisateur, ce qui correspond a son intention.
 */
export async function geocode(
  query: string,
  lang: string = "fr",
  bias?: { lat: number; lng: number } | null
): Promise<GeocodeResult> {
  const q = query.trim();
  if (!q) throw new NotFoundError("Saisie vide.");

  // Photon ne gere que quelques langues ; on retombe sur l'anglais sinon.
  const supported = ["fr", "en", "de", "it"];
  const l = supported.includes(lang) ? lang : "en";

  const params = new URLSearchParams({ q, limit: "5", lang: l });
  if (bias) {
    params.set("lat", String(bias.lat));
    params.set("lon", String(bias.lng));
    // Renforce la priorite donnee a la proximite geographique.
    params.set("location_bias_scale", "0.5");
  }

  const data = await callPhoton(`/api/?${params}`);

  const features: any[] = data?.features ?? [];
  if (features.length === 0) {
    throw new NotFoundError(`Aucun lieu trouvé pour "${q}".`);
  }

  // Une saisie purement numerique est un code postal : on ne retient qu'un
  // resultat qui en est reellement un, pour eviter les homonymes lointains.
  const isPostcode = /^\d{4,6}$/.test(q);
  const feature =
    (isPostcode && features.find((f) => f.properties?.postcode === q)) || features[0];

  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng, label: buildLabel(feature.properties ?? {}) || q };
}

/**
 * Convertit des coordonnees GPS en nom de lieu reel (geocodage inverse).
 * Sert a afficher ou se trouve reellement l'utilisateur apres la geolocalisation.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  lang: string = "fr"
): Promise<GeocodeResult> {
  const supported = ["fr", "en", "de", "it"];
  const l = supported.includes(lang) ? lang : "en";

  const params = new URLSearchParams({ lat: String(lat), lon: String(lng), lang: l });
  const data = await callPhoton(`/reverse?${params}`);

  const feature = data?.features?.[0];
  if (!feature) {
    throw new NotFoundError("Position non identifiée.");
  }

  return { lat, lng, label: buildLabel(feature.properties ?? {}) };
}
