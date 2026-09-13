import type { DashboardData, NewsItem, WeatherData } from "./types.js";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&current=temperature_2m,weather_code&timezone=auto";
const NEWS_URL = "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=3";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function getWeatherCondition(code?: number): string {
  switch (code) {
    case 0:
      return "Clear";
    case 1:
    case 2:
    case 3:
      return "Partly cloudy";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Rainy";
    default:
      return "Mild";
  }
}

export function fetchWeather(): Promise<WeatherData> {
  return fetchJson<{ current?: { temperature_2m?: number; weather_code?: number } }>(WEATHER_URL).then(
    (data) => ({
      city: "Johannesburg",
      temperature: data.current?.temperature_2m ?? 0,
      condition: getWeatherCondition(data.current?.weather_code),
    }),
  );
}

export function fetchNews(): Promise<NewsItem[]> {
  return fetchJson<{ hits?: Array<{ title?: string; url?: string; author?: string }> }>(NEWS_URL).then(
    (data) =>
      (data.hits ?? []).slice(0, 3).map((item) => ({
        source: item.author ?? "Hacker News",
        title: item.title ?? "Untitled story",
        ...(item.url ? { url: item.url } : {}),
      })),
  );
}

export function fetchDashboardWithPromiseAll(): Promise<DashboardData> {
  return Promise.all([fetchWeather(), fetchNews()]).then(([weather, news]) => ({
    weather,
    news,
  }));
}

export function fetchDashboardWithChaining(): Promise<DashboardData> {
  return fetchWeather()
    .then((weather) => fetchNews().then((news) => ({ weather, news })))
    .catch((error) => {
      console.error("Failed to fetch chained dashboard data:", error);
      throw error;
    });
}

export function fetchFastestRequest(): Promise<string> {
  return Promise.race([
    fetchWeather().then(() => "Weather finished first"),
    fetchNews().then(() => "News finished first"),
  ]);
}
