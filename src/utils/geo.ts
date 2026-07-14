import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * unsupported        : aucune API de position disponible
 * denied             : l'utilisateur a refuse, on peut redemander
 * denied_permanently : refus definitif, seul un passage par les reglages debloque
 * unavailable        : position introuvable (GPS coupe, interieur, pas de signal)
 * timeout            : la position n'a pas ete obtenue a temps
 */
export type GeoErrorKind =
  | "unsupported"
  | "denied"
  | "denied_permanently"
  | "unavailable"
  | "timeout";

export class GeoError extends Error {
  constructor(public kind: GeoErrorKind, message: string) {
    super(message);
    this.name = "GeoError";
  }
}

export const isNative = () => Capacitor.isNativePlatform();

const OPTIONS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

/**
 * Recupere la position courante.
 *
 * Sur mobile (APK), passe par le plugin natif Capacitor : c'est lui qui
 * declenche la boite de dialogue systeme d'Android. L'API web
 * navigator.geolocation ne suffit pas dans une WebView.
 */
export async function getCurrentCoords(): Promise<Coords> {
  if (isNative()) {
    let status = await Geolocation.checkPermissions();

    if (status.location !== "granted" && status.coarseLocation !== "granted") {
      status = await Geolocation.requestPermissions({
        permissions: ["location", "coarseLocation"],
      });
    }

    const granted =
      status.location === "granted" || status.coarseLocation === "granted";

    if (!granted) {
      // "denied" apres une demande explicite signifie, sur Android, que le
      // systeme ne reaffichera plus la boite de dialogue.
      const permanent =
        status.location === "denied" && status.coarseLocation === "denied";
      throw new GeoError(
        permanent ? "denied_permanently" : "denied",
        "Autorisation de localisation refusee."
      );
    }

    try {
      const pos = await Geolocation.getCurrentPosition(OPTIONS);
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      throw new GeoError(
        /time ?out/i.test(msg) ? "timeout" : "unavailable",
        msg
      );
    }
  }

  if (!("geolocation" in navigator)) {
    throw new GeoError(
      "unsupported",
      "La geolocalisation n'est pas supportee par ce navigateur."
    );
  }

  return new Promise<Coords>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => {
        const kind: GeoErrorKind =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
            ? "timeout"
            : "unavailable";
        reject(new GeoError(kind, err.message));
      },
      OPTIONS
    );
  });
}

/** Message lisible par l'utilisateur, adapte a la cause reelle du blocage. */
export function geoErrorMessage(e: unknown, lang: string): string {
  const fr = lang === "fr";
  const kind = e instanceof GeoError ? e.kind : "unavailable";

  switch (kind) {
    case "unsupported":
      return fr
        ? "La géolocalisation n'est pas disponible sur cet appareil."
        : "Geolocation is not available on this device.";
    case "denied":
      return fr
        ? "Accès à la position refusé. Réessayez et acceptez la demande d'autorisation."
        : "Location access denied. Try again and accept the permission prompt.";
    case "denied_permanently":
      return fr
        ? "Accès à la position bloqué. Ouvrez Réglages > Applications > Saison et Terroir > Autorisations > Position, puis choisissez « Autoriser uniquement pendant l'utilisation »."
        : "Location access blocked. Open Settings > Apps > Saison et Terroir > Permissions > Location, then choose \"Allow only while using the app\".";
    case "timeout":
      return fr
        ? "La position n'a pas pu être obtenue à temps. Placez-vous près d'une fenêtre ou activez le GPS, puis réessayez."
        : "Could not get your position in time. Move near a window or enable GPS, then try again.";
    default:
      return fr
        ? "Position introuvable. Vérifiez que la localisation est activée sur votre téléphone."
        : "Position unavailable. Check that location is enabled on your phone.";
  }
}
