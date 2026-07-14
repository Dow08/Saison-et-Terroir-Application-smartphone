export interface WeatherDay {
  day: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "windy";
  temp: number; // in Celsius
  labelFr: string;
  labelEn: string;
  icon: string; // Emoji
  isDangerousForOutdoor: boolean;
}

// Generate the weather data for July 2026 deterministically
export const getJulyWeather = (): { [day: number]: WeatherDay } => {
  const weatherMap: { [day: number]: WeatherDay } = {};

  for (let day = 1; day <= 31; day++) {
    // Stormy/Tempête days (unfavorable/dangerous for outdoor activities like surfing, hiking, etc.)
    if (day === 5) {
      weatherMap[day] = {
        day,
        condition: "stormy",
        temp: 16,
        labelFr: "Violente Tempête & Orages",
        labelEn: "Violent Storm & Thunderstorms",
        icon: "⛈️",
        isDangerousForOutdoor: true,
      };
    } else if (day === 12) {
      weatherMap[day] = {
        day,
        condition: "stormy",
        temp: 15,
        labelFr: "Alerte Tempête & Vagues submersion",
        labelEn: "Storm Alert & Tidal Waves Warning",
        icon: "🌊⛈️",
        isDangerousForOutdoor: true,
      };
    } else if (day === 19) {
      weatherMap[day] = {
        day,
        condition: "rainy",
        temp: 14,
        labelFr: "Pluies diluviennes & Bourrasques",
        labelEn: "Torrential Rain & Heavy Gales",
        icon: "🌧️💨",
        isDangerousForOutdoor: true,
      };
    } else if (day === 26) {
      weatherMap[day] = {
        day,
        condition: "stormy",
        temp: 13,
        labelFr: "Alerte Météo : Tempête de vent",
        labelEn: "Weather Alert: Severe Windstorm",
        icon: "🌪️⛈️",
        isDangerousForOutdoor: true,
      };
    } else if (day % 4 === 0) {
      weatherMap[day] = {
        day,
        condition: "cloudy",
        temp: 22,
        labelFr: "Nuageux avec éclaircies",
        labelEn: "Cloudy with sunny intervals",
        icon: "⛅",
        isDangerousForOutdoor: false,
      };
    } else if (day % 7 === 0) {
      weatherMap[day] = {
        day,
        condition: "rainy",
        temp: 19,
        labelFr: "Pluie légère intermittente",
        labelEn: "Light intermittent rain",
        icon: "🌧️",
        isDangerousForOutdoor: false, // light rain is okay, but not ideal
      };
    } else {
      weatherMap[day] = {
        day,
        condition: "sunny",
        temp: 28 + (day % 5),
        labelFr: "Grand soleil radieux",
        labelEn: "Bright sunny skies",
        icon: "☀️",
        isDangerousForOutdoor: false,
      };
    }
  }

  return weatherMap;
};

// Check if an activity category is considered outdoor
export const isOutdoorCategory = (category: string): boolean => {
  if (!category) return false;
  const cat = category.toLowerCase();
  return (
    cat.includes("sport") ||
    cat.includes("nature") ||
    cat.includes("relaxation") ||
    cat.includes("plein air") ||
    cat.includes("outdoor") ||
    cat.includes("waves") ||
    cat.includes("mountain") ||
    cat.includes("umbrella") ||
    cat.includes("compass") ||
    cat.includes("aventure") ||
    cat.includes("adventure")
  );
};
