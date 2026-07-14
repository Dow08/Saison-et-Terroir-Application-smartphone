/**
 * Activites reelles issues d'OpenStreetMap via l'API Overpass.
 * Gratuit, sans cle API, couverture mondiale.
 *
 * Regle absolue de ce module : on ne renvoie que ce qu'OSM contient
 * reellement. Aucun prix, aucun avis, aucun contact n'est invente.
 * Un champ absent reste absent.
 */

import { Activity, ActivityCategory } from "../types";
import { NetworkError } from "./geocoding";

/**
 * Miroirs Overpass, essayes dans l'ordre. Ces instances publiques appliquent
 * une limitation d'usage : disposer de plusieurs points d'entree evite qu'une
 * indisponibilite passagere prive l'utilisateur de resultats.
 *
 * Note : overpass.osm.ch est volontairement exclu, il ne couvre que la Suisse.
 */
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

/** Icone lucide-react associee a chaque categorie. */
const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  Nature: "Trees",
  Culture: "Landmark",
  Gastronomy: "Grape",
  Sport: "Bike",
  Relaxation: "Flower2",
};

/** Determine la categorie d'un element OSM a partir de ses tags. */
function categorize(tags: Record<string, string>): ActivityCategory | null {
  const has = (k: string, v: string) => tags[k] === v;

  if (
    has("leisure", "nature_reserve") || has("leisure", "park") ||
    has("tourism", "viewpoint") || has("natural", "peak") ||
    has("natural", "waterfall") || has("natural", "cave_entrance") ||
    has("natural", "beach")
  ) return "Nature";

  if (
    has("tourism", "museum") || has("tourism", "gallery") ||
    has("tourism", "artwork") || has("tourism", "attraction") ||
    tags.historic || has("amenity", "theatre") || has("amenity", "arts_centre")
  ) return "Culture";

  if (
    has("craft", "winery") || has("shop", "wine") || has("shop", "cheese") ||
    has("shop", "farm") || has("amenity", "marketplace") ||
    has("tourism", "wine_cellar")
  ) return "Gastronomy";

  if (
    has("leisure", "sports_centre") || has("leisure", "climbing") ||
    has("leisure", "golf_course") || has("leisure", "horse_riding") ||
    has("leisure", "water_park") || has("leisure", "swimming_pool") ||
    has("tourism", "theme_park")
  ) return "Sport";

  if (
    has("leisure", "spa") || has("amenity", "spa") ||
    has("amenity", "public_bath") || has("leisure", "sauna") ||
    has("leisure", "garden")
  ) return "Relaxation";

  return null;
}

/**
 * Libelle factuel du type de lieu, deduit des tags OSM.
 * Ce n'est pas une description marketing : c'est ce que le lieu EST.
 */
const TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  "leisure=nature_reserve": { fr: "Réserve naturelle", en: "Nature reserve" },
  "leisure=park": { fr: "Parc", en: "Park" },
  "tourism=viewpoint": { fr: "Point de vue", en: "Viewpoint" },
  "natural=peak": { fr: "Sommet", en: "Peak" },
  "natural=waterfall": { fr: "Cascade", en: "Waterfall" },
  "natural=cave_entrance": { fr: "Grotte", en: "Cave" },
  "natural=beach": { fr: "Plage", en: "Beach" },
  "tourism=museum": { fr: "Musée", en: "Museum" },
  "tourism=gallery": { fr: "Galerie d'art", en: "Art gallery" },
  "tourism=artwork": { fr: "Œuvre d'art", en: "Artwork" },
  "tourism=attraction": { fr: "Site touristique", en: "Tourist attraction" },
  "historic=castle": { fr: "Château", en: "Castle" },
  "historic=monument": { fr: "Monument", en: "Monument" },
  "historic=ruins": { fr: "Ruines", en: "Ruins" },
  "historic=archaeological_site": { fr: "Site archéologique", en: "Archaeological site" },
  "amenity=theatre": { fr: "Théâtre", en: "Theatre" },
  "amenity=arts_centre": { fr: "Centre culturel", en: "Arts centre" },
  "craft=winery": { fr: "Domaine viticole", en: "Winery" },
  "shop=wine": { fr: "Caviste", en: "Wine shop" },
  "shop=cheese": { fr: "Fromagerie", en: "Cheese shop" },
  "shop=farm": { fr: "Vente à la ferme", en: "Farm shop" },
  "amenity=marketplace": { fr: "Marché", en: "Marketplace" },
  "tourism=wine_cellar": { fr: "Cave à vin", en: "Wine cellar" },
  "leisure=sports_centre": { fr: "Centre sportif", en: "Sports centre" },
  "leisure=climbing": { fr: "Site d'escalade", en: "Climbing site" },
  "leisure=golf_course": { fr: "Golf", en: "Golf course" },
  "leisure=horse_riding": { fr: "Centre équestre", en: "Horse riding" },
  "leisure=water_park": { fr: "Parc aquatique", en: "Water park" },
  "leisure=swimming_pool": { fr: "Piscine", en: "Swimming pool" },
  "tourism=theme_park": { fr: "Parc à thème", en: "Theme park" },
  "leisure=spa": { fr: "Spa", en: "Spa" },
  "amenity=spa": { fr: "Spa", en: "Spa" },
  "amenity=public_bath": { fr: "Bains publics", en: "Public baths" },
  "leisure=sauna": { fr: "Sauna", en: "Sauna" },
  "leisure=garden": { fr: "Jardin", en: "Garden" },
};

function typeLabel(tags: Record<string, string>, lang: string): string {
  for (const key of Object.keys(TYPE_LABELS)) {
    const [k, v] = key.split("=");
    if (tags[k] === v) {
      const entry = TYPE_LABELS[key];
      return lang === "fr" ? entry.fr : entry.en;
    }
  }
  return lang === "fr" ? "Lieu d'intérêt" : "Point of interest";
}

/** Distance a vol d'oiseau en kilometres (formule de Haversine). */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Filtres regroupes par cle OSM.
 *
 * Une clause par valeur (33 au total) rendait la requete trop couteuse :
 * les trois miroirs Overpass depassaient le delai maximal. Les regrouper par
 * cle avec une expression reguliere ramene la requete a 7 clauses, ce qui la
 * rend exploitable en production.
 */
const KEY_FILTERS: Array<[string, string[]]> = [
  ["tourism", ["museum", "gallery", "artwork", "attraction", "viewpoint", "theme_park", "wine_cellar"]],
  ["historic", ["castle", "monument", "ruins", "archaeological_site"]],
  ["leisure", [
    "nature_reserve", "park", "garden", "sports_centre", "climbing",
    "golf_course", "horse_riding", "water_park", "swimming_pool", "spa", "sauna",
  ]],
  ["natural", ["peak", "waterfall", "cave_entrance", "beach"]],
  ["amenity", ["theatre", "arts_centre", "marketplace", "spa", "public_bath"]],
  ["craft", ["winery"]],
  ["shop", ["wine", "cheese", "farm"]],
];

/** Construit la requete Overpass QL. */
function buildQuery(lat: number, lng: number, radiusMeters: number): string {
  const around = `(around:${radiusMeters},${lat},${lng})`;
  const clauses = KEY_FILTERS.map(
    ([key, values]) => `nwr["${key}"~"^(${values.join("|")})$"]["name"]${around};`
  ).join("\n  ");

  // L'ordre des parametres de 'out' est impose par Overpass :
  // verbosite (tags), puis geometrie (center), puis limite.
  // 'out center tags' provoque une erreur 406.
  return `[out:json][timeout:60];
(
  ${clauses}
);
out tags center 400;`;
}

/** Tarification, uniquement si OSM la renseigne. */
function readFee(tags: Record<string, string>): { fee: Activity["fee"]; charge?: string } {
  if (tags.fee === "no") return { fee: "free" };
  if (tags.charge) return { fee: "paid", charge: tags.charge };
  if (tags.fee === "yes") return { fee: "paid" };
  return { fee: "unknown" };
}

export interface FetchActivitiesResult {
  activities: Activity[];
  /** Nombre d'elements renvoyes par OSM avant filtrage par rayon. */
  rawCount: number;
}

/**
 * Recupere les activites reelles autour d'un point.
 * @param radiusKm rayon de recherche en kilometres
 */
export async function fetchActivities(
  lat: number,
  lng: number,
  radiusKm: number,
  lang: string = "fr"
): Promise<FetchActivitiesResult> {
  const query = buildQuery(lat, lng, Math.round(radiusKm * 1000));

  let data: any = null;
  let lastError: unknown = null;

  for (const endpoint of ENDPOINTS) {
    try {
      // Sans delai maximal, un miroir surcharge peut ne jamais repondre et
      // laisser l'utilisateur bloque sur l'indicateur de chargement.
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) {
        lastError = new NetworkError(`Overpass a répondu ${res.status}.`);
        continue;
      }

      const payload = await res.json();

      // Piege : en cas de limitation de debit ou de surcharge, Overpass renvoie
      // un statut 200 avec une liste vide et un champ "remark". Sans ce test, on
      // afficherait "aucune activite" alors que le service a simplement refuse
      // de repondre. On bascule donc sur le miroir suivant.
      if (payload?.remark) {
        lastError = new NetworkError(`Overpass : ${payload.remark}`);
        continue;
      }

      data = payload;
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!data) {
    throw new NetworkError(
      lastError instanceof Error
        ? `Impossible de joindre OpenStreetMap : ${lastError.message}`
        : "Impossible de joindre OpenStreetMap."
    );
  }

  const elements: any[] = Array.isArray(data.elements) ? data.elements : [];
  const seen = new Set<string>();
  const activities: Activity[] = [];

  for (const el of elements) {
    const tags: Record<string, string> = el.tags || {};
    const name = tags.name;
    if (!name) continue;

    const category = categorize(tags);
    if (!category) continue;

    // 'center' pour les chemins et relations, 'lat/lon' pour les noeuds.
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (typeof elLat !== "number" || typeof elLng !== "number") continue;

    // Deduplication : un meme lieu peut exister en noeud et en chemin.
    const key = `${name}|${elLat.toFixed(3)}|${elLng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const dist = distanceKm(lat, lng, elLat, elLng);
    if (dist > radiusKm) continue;

    const { fee, charge } = readFee(tags);

    const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
      .filter(Boolean)
      .join(" ") || undefined;

    activities.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      category,
      icon: CATEGORY_ICONS[category],
      typeLabel: typeLabel(tags, lang),
      lat: elLat,
      lng: elLng,
      distanceKm: dist,
      fee,
      charge,
      website: tags.website || tags["contact:website"] || undefined,
      phone: tags.phone || tags["contact:phone"] || undefined,
      email: tags.email || tags["contact:email"] || undefined,
      openingHours: tags.opening_hours || undefined,
      address,
      wheelchair: tags.wheelchair || undefined,
      osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      // Recherche Google Maps du lieu : l'utilisateur y trouve les vrais avis.
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${name} ${tags["addr:city"] ?? ""}`
      )}`,
    });
  }

  activities.sort((a, b) => a.distanceKm - b.distanceKm);

  return { activities, rawCount: elements.length };
}
