/**
 * Embedded fallback data for offline APK mode.
 * Extracted from server.ts FALLBACK_DATA — used when no backend is available.
 */

import type { PushNotification } from "../types";

// ── Activities Fallback ──────────────────────────────────────────────

export const FALLBACK_ACTIVITIES: { [key: string]: any[] } = {
  fr: [
    {
      id: "act-1",
      name: "Randonnée dans les Gorges du Verdon",
      category: "Nature",
      icon: "Mountain",
      description: "Explorez le plus grand canyon d'Europe avec ses eaux turquoise spectaculaires et ses sentiers escarpés.",
      bestPeriod: "Mai - Septembre",
      price: "Gratuit (Accès libre)",
      bookingUrl: "https://www.lesgorgesduverdon.fr",
      website: "https://www.lesgorgesduverdon.fr",
      comparison: "Option la plus économique pour les amoureux de grands espaces.",
      googleReviews: {
        rating: 4.8,
        count: 12450,
        recentReview: "Des paysages incroyables ! Une randonnée incontournable en France.",
        reviewsList: [
          { author: "Marie L.", rating: 5, text: "Une merveille absolue de la nature. Les sentiers sont bien balisés mais physiques !" },
          { author: "Thomas B.", rating: 4, text: "Magnifique rando ! Attention à bien prendre de l'eau car ça tape en été." },
          { author: "Sarah M.", rating: 5, text: "L'eau a une couleur irréelle, c'est tout simplement grandiose." }
        ]
      },
      phone: "+33 4 92 78 01 01",
      email: "contact@verdon-tourisme.com",
      latOffset: 0.012,
      lngOffset: -0.008
    },
    {
      id: "act-2",
      name: "Dégustation de Vins et Fromages à Bordeaux",
      category: "Gastronomie",
      icon: "Utensils",
      description: "Découvrez l'art d'associer de grands crus bordelais avec des fromages affinés locaux dans un château historique.",
      bestPeriod: "Toute l'année (Idéal en Automne)",
      price: "35€ par personne",
      bookingUrl: "https://www.bordeaux-tourisme.com",
      website: "https://www.bordeaux-tourisme.com",
      comparison: "Excellent rapport qualité-prix comparé aux dégustations privées de la région (environ 50€).",
      googleReviews: {
        rating: 4.7,
        count: 680,
        recentReview: "Le sommelier était passionné et les vins divins !",
        reviewsList: [
          { author: "Pierre G.", rating: 5, text: "Un accueil chaleureux dans un cadre historique magnifique. L'accord vins et fromages est parfait." },
          { author: "Chantal R.", rating: 4, text: "Explications très claires pour les débutants, vins de grande qualité." },
          { author: "Julien H.", rating: 5, text: "La meilleure dégustation de notre séjour à Bordeaux !" }
        ]
      },
      phone: "+33 5 56 00 66 00",
      email: "reservations@chateaubordeaux.fr",
      latOffset: -0.005,
      lngOffset: 0.015
    },
    {
      id: "act-3",
      name: "Cours de Surf à Biarritz",
      category: "Sport",
      icon: "Waves",
      description: "Apprenez à dompter les vagues légendaires de la Côte des Basques avec un moniteur certifié d'État.",
      bestPeriod: "Juin - Octobre",
      price: "45€ / cours de 2h",
      bookingUrl: "https://www.biarritz-surf.com",
      website: "https://www.biarritz-surf.com",
      comparison: "Prix moyen similaire, mais équipement haut de gamme et petit groupe (max 6).",
      googleReviews: {
        rating: 4.9,
        count: 912,
        recentReview: "Moniteur super patient, j'ai réussi à me lever sur ma première vague !",
        reviewsList: [
          { author: "Antoine P.", rating: 5, text: "École au top ! Le prof s'adapte à tous les niveaux. Matériel propre." },
          { author: "Sophie T.", rating: 5, text: "Incroyable expérience pour ma fille de 12 ans. Elle a adoré son cours !" },
          { author: "Marc D.", rating: 4, text: "Super accueil et vagues parfaites sur la Côte des Basques." }
        ]
      },
      phone: "+33 5 59 22 33 44",
      email: "aloha@biarritz-surf-ecole.fr",
      latOffset: -0.018,
      lngOffset: -0.012
    },
    {
      id: "act-4",
      name: "Détente au Lac de Prades",
      category: "Relaxation",
      icon: "Umbrella",
      description: "Profitez d'une journée de ressourcement d'exception au bord des eaux calmes du lac, idéal pour le farniente et les pique-niques gourmands.",
      bestPeriod: "Juin - Septembre",
      price: "Gratuit (Accès libre)",
      bookingUrl: "https://www.tourisme-pyrenees-orientales.com",
      website: "https://www.tourisme-pyrenees-orientales.com",
      comparison: "La meilleure option nature et détente gratuite de la région pour toute la famille.",
      googleReviews: {
        rating: 4.8,
        count: 1450,
        recentReview: "Un véritable havre de paix, parfait pour se détendre l'été en famille !",
        reviewsList: [
          { author: "Marie-Thérèse D.", rating: 5, text: "Le lac est calme, propre et entouré de montagnes sublimes. Très reposant !" },
          { author: "Jean-Marc L.", rating: 4, text: "Excellent endroit pour pique-niquer à l'ombre. Accès facile." },
          { author: "Stéphanie P.", rating: 5, text: "Calme absolu, un régal pour se détendre et faire du paddle." }
        ]
      },
      phone: "+33 4 68 05 41 02",
      email: "contact@prades-tourisme.fr",
      latOffset: 0.02,
      lngOffset: 0.003
    }
  ],
  en: [
    {
      id: "act-1",
      name: "Hiking in the Verdon Gorge",
      category: "Nature",
      icon: "Mountain",
      description: "Explore the largest canyon in Europe with its spectacular turquoise waters and steep, scenic paths.",
      bestPeriod: "May - September",
      price: "Free (Open Access)",
      bookingUrl: "https://www.lesgorgesduverdon.fr/en",
      website: "https://www.lesgorgesduverdon.fr",
      comparison: "Most economical option for nature lovers.",
      googleReviews: {
        rating: 4.8,
        count: 12450,
        recentReview: "Unbelievable landscapes! A must-do hike in France.",
        reviewsList: [
          { author: "John D.", rating: 5, text: "Unbelievable views, hike was a bit challenging but definitely worth it!" },
          { author: "Alice S.", rating: 4, text: "Scenic route with spectacular turquoise water. Highly recommended." },
          { author: "James R.", rating: 5, text: "One of the best hikes I've ever done in Europe!" }
        ]
      },
      phone: "+33 4 92 78 01 01",
      email: "contact@verdon-tourisme.com",
      latOffset: 0.012,
      lngOffset: -0.008
    },
    {
      id: "act-2",
      name: "Wine and Cheese Tasting in Bordeaux",
      category: "Gastronomy",
      icon: "Utensils",
      description: "Discover the art of pairing top Bordeaux wines with local matured cheeses in a historical estate.",
      bestPeriod: "All year round (Ideal in Autumn)",
      price: "35€ per person",
      bookingUrl: "https://www.bordeaux-tourisme.com/en",
      website: "https://www.bordeaux-tourisme.com",
      comparison: "Excellent value compared to private tastings in the region which average around 50€.",
      googleReviews: {
        rating: 4.7,
        count: 680,
        recentReview: "The sommelier was passionate and the wines were out of this world!",
        reviewsList: [
          { author: "Robert T.", rating: 5, text: "Excellent wine selection paired with perfect cheeses. Exceptional service!" },
          { author: "Emma K.", rating: 4, text: "Great experience learning about wine pairings. Informative and delicious." },
          { author: "Oliver P.", rating: 5, text: "Best wine tasting experience in Bordeaux!" }
        ]
      },
      phone: "+33 5 56 00 66 00",
      email: "reservations@chateaubordeaux.fr",
      latOffset: -0.005,
      lngOffset: 0.015
    },
    {
      id: "act-3",
      name: "Surfing Lessons in Biarritz",
      category: "Sport",
      icon: "Waves",
      description: "Learn to ride the legendary waves of the Basque Coast with a certified instructor.",
      bestPeriod: "June - October",
      price: "45€ / 2h lesson",
      bookingUrl: "https://www.biarritz-surf.com",
      website: "https://www.biarritz-surf.com",
      comparison: "Similar average price, but premium equipment and small groups (max 6).",
      googleReviews: {
        rating: 4.9,
        count: 912,
        recentReview: "Super patient instructor, I managed to stand on my first wave!",
        reviewsList: [
          { author: "Chris M.", rating: 5, text: "Amazing school! The instructor adapts to all levels. Clean gear." },
          { author: "Laura B.", rating: 5, text: "Incredible experience for my 12-year-old daughter. She loved it!" },
          { author: "David H.", rating: 4, text: "Great welcome and perfect waves on the Basque Coast." }
        ]
      },
      phone: "+33 5 59 22 33 44",
      email: "aloha@biarritz-surf-ecole.fr",
      latOffset: -0.018,
      lngOffset: -0.012
    },
    {
      id: "act-4",
      name: "Relaxation at Lake Prades",
      category: "Relaxation",
      icon: "Umbrella",
      description: "Enjoy an exceptional day of relaxation by the calm waters of the lake, ideal for lounging and gourmet picnics.",
      bestPeriod: "June - September",
      price: "Free (Open Access)",
      bookingUrl: "https://www.tourisme-pyrenees-orientales.com",
      website: "https://www.tourisme-pyrenees-orientales.com",
      comparison: "The best free nature and relaxation option in the region for the whole family.",
      googleReviews: {
        rating: 4.8,
        count: 1450,
        recentReview: "A true haven of peace, perfect for family relaxation in summer!",
        reviewsList: [
          { author: "Catherine D.", rating: 5, text: "The lake is calm, clean and surrounded by sublime mountains. Very restful!" },
          { author: "John-Marc L.", rating: 4, text: "Excellent spot for picnicking in the shade. Easy access." },
          { author: "Stephanie P.", rating: 5, text: "Absolute calm, a delight for relaxation and paddleboarding." }
        ]
      },
      phone: "+33 4 68 05 41 02",
      email: "contact@prades-tourisme.fr",
      latOffset: 0.02,
      lngOffset: 0.003
    }
  ]
};

// ── News Fallback ────────────────────────────────────────────────────

export function getFallbackNews(location: string, _season: string, lang: string): any[] {
  const isFr = lang === "fr";
  const norm = location.toLowerCase();

  if (norm.includes("biarritz") || norm.includes("basque")) {
    return [
      {
        id: "news-1",
        title: isFr ? "Coupe de Surf de Biarritz : Les inscriptions sont ouvertes !" : "Biarritz Surf Cup: Registrations are open!",
        summary: isFr ? "Le plus ancien club de surf de la Côte des Basques organise son trophée annuel. Des compétiteurs de toute l'Europe sont attendus." : "The oldest surf club on the Basque Coast organizes its annual trophy. Competitors from all over Europe are expected.",
        source: "Sud Ouest",
        date: "Aujourd'hui",
        category: "Sport",
        link: "https://www.sudouest.fr"
      },
      {
        id: "news-2",
        title: isFr ? "Festival Biarritz Amérique Latine : Projections en plein air" : "Biarritz Latin America Festival: Open-air screenings",
        summary: isFr ? "Profitez des douces soirées pour regarder des chefs-d'œuvre du cinéma latino-américain projetés sur écran géant face à la mer." : "Enjoy the mild evenings to watch masterpieces of Latin American cinema projected on a giant screen facing the sea.",
        source: "Biarritz Info",
        date: "Hier",
        category: "Festival",
        link: "https://www.biarritz.fr"
      },
      {
        id: "news-3",
        title: isFr ? "Marché de producteurs locaux aux Halles" : "Local farmers' market at the Halles",
        summary: isFr ? "Tous les matins, venez déguster le véritable gâteau basque, le jambon de Bayonne et le fromage de brebis Ossau-Iraty frais." : "Every morning, come and taste the authentic Basque cake, Bayonne ham, and fresh Ossau-Iraty sheep cheese.",
        source: "Office de Tourisme",
        date: "Cette semaine",
        category: "Gastronomie",
        link: "https://tourisme.biarritz.fr"
      }
    ];
  }

  if (norm.includes("bordeaux")) {
    return [
      {
        id: "news-1",
        title: isFr ? "Bordeaux Fête le Vin : Les voiliers légendaires arrivent au port" : "Bordeaux Wine Festival: Legendary tall ships arrive at port",
        summary: isFr ? "Le long des quais de la Garonne, dégustez les vins de la région et visitez de magnifiques voiliers historiques ouverts au public." : "Along the banks of the Garonne, taste regional wines and visit magnificent historic tall ships open to the public.",
        source: "Bordeaux Métropole",
        date: "Aujourd'hui",
        category: "Festival",
        link: "https://www.bordeaux-fete-le-vin.com"
      },
      {
        id: "news-2",
        title: isFr ? "Exposition temporaire aux Bassins des Lumières" : "Temporary exhibition at Bassins des Lumières",
        summary: isFr ? "Une expérience immersive d'art numérique projetée sur les immenses parois en béton de l'ancienne base sous-marine de Bordeaux." : "An immersive digital art experience projected onto the massive concrete walls of Bordeaux's former submarine base.",
        source: "L'Hebdo Bordeaux",
        date: "Cette semaine",
        category: "Culture",
        link: "https://www.bassins-lumieres.com"
      }
    ];
  }

  // Universal fallback news
  return [
    {
      id: "news-1",
      title: isFr ? "Marché artisanal saisonnier de la région" : "Seasonal regional craft market",
      summary: isFr ? "Découvrez le savoir-faire des artisans locaux : poterie, bijoux faits main, miel de montagne et spécialités du terroir." : "Discover the skills of local craftsmen: pottery, handmade jewelry, mountain honey, and local specialties.",
      source: "Actu Locale",
      date: "Aujourd'hui",
      category: "Culture",
      link: "https://www.actu.fr"
    },
    {
      id: "news-2",
      title: isFr ? "Prévisions météo : Conditions idéales pour les activités de plein air" : "Weather forecast: Ideal conditions for outdoor activities",
      summary: isFr ? "Un grand soleil et des températures très agréables sont prévus pour toute la semaine, parfaits pour explorer les sentiers locaux." : "Bright sunshine and very pleasant temperatures are forecast for the entire week, perfect for exploring local trails.",
      source: "Météo Régionale",
      date: "En continu",
      category: "Météo",
      link: "https://meteofrance.com"
    }
  ];
}

export function getFallbackNewsForPage(location: string, season: string, lang: string, pageNum: number): any[] {
  const baseNews = getFallbackNews(location, season, lang);
  return baseNews.map((item, idx) => ({
    ...item,
    id: `news-p${pageNum}-${idx}`,
    title: pageNum > 1 ? `${item.title} - Vol. ${pageNum}` : item.title,
    summary: `${item.summary} (Page ${pageNum}/50 du guide local).`,
    date: pageNum === 1 ? item.date : `Il y a ${pageNum + idx} jours`
  }));
}

// ── Build info fallback ──────────────────────────────────────────────

export const FALLBACK_BUILD_INFO = {
  version: "1.3.0",
  buildTime: "2026-07-14T02:40:00.000Z",
  status: "healthy",
  securityAudit: {
    headersConfigured: true,
    corsRestricted: true,
    xssProtected: true,
    noVulnerabilities: true,
  }
};

// ── Helper: compute activities with coordinates ──────────────────────

export function computeLocalActivities(
  lang: string,
  season: string,
  searchRadius: number,
  centerLat: number,
  centerLng: number
): { activities: any[]; locationName: string } {
  const baseFallback = FALLBACK_ACTIVITIES[lang] || FALLBACK_ACTIVITIES["fr"];
  const maxOffsetLat = searchRadius / 111;
  const maxOffsetLng = searchRadius / (111 * Math.cos(centerLat * Math.PI / 180) || 80);

  const activities = baseFallback.map((item: any, idx: number) => {
    const scaledLatOffset = ((item.latOffset || 0.01) / 0.02) * maxOffsetLat;
    const scaledLngOffset = ((item.lngOffset || -0.01) / 0.02) * maxOffsetLng;
    return {
      ...item,
      id: `local-${idx}-${season}`,
      lat: centerLat + scaledLatOffset,
      lng: centerLng + scaledLngOffset
    };
  });

  return { activities, locationName: "France" };
}

// ── Default welcome notification ─────────────────────────────────────

export function getDefaultNotifications(): PushNotification[] {
  return [
    {
      id: "welcome-notif",
      title: "Bienvenue sur Saison & Terroir ! 🌍",
      body: "Découvrez les meilleures activités de saison près de chez vous.",
      timestamp: new Date().toISOString(),
      category: "system",
      read: false
    }
  ];
}
