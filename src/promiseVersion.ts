import "dotenv/config";
import type { NewsItem } from "./types/news.js";
import type { DashboardData, WeatherData } from "./types/weather.js";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!WEATHER_API_KEY) {
  throw new Error("Missing WEATHER_API_KEY in .env");
}
if (!NEWS_API_KEY) {
  throw new Error("Missing NEWS_API_KEY in .env");
}

const NEWS_URL = `https://newsapi.org/v2/top-headlines?country=za&pageSize=3&apiKey=${NEWS_API_KEY}`;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

// Weather fetcher with city support
export function fetchWeather(city: string): Promise<WeatherData> {
  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

  return fetchJson<{ main?: { temp?: number }; weather?: Array<{ description?: string }> }>(WEATHER_URL).then(
    (data) => ({
      city,
      temperature: data.main?.temp ?? 0,
      condition: data.weather?.[0]?.description ?? "Unknown",
    }),
  );
}

// News fetcher
export function fetchNews(): Promise<NewsItem[]> {
  return fetchJson<{ articles?: Array<{ title?: string; url?: string; source?: { name?: string } }> }>(NEWS_URL).then(
    (data) =>
      (data.articles ?? []).slice(0, 3).map((item) => ({
        source: item.source?.name ?? "News API",
        title: item.title ?? "Untitled story",
        ...(item.url ? { url: item.url } : {}),
      })),
  );
}

// Dashboard with Promise.all
export function fetchDashboardWithPromiseAll(city: string): Promise<DashboardData> {
  return Promise.all([fetchWeather(city), fetchNews()]).then(([weather, news]) => ({
    weather,
    news,
  }));
}

// Dashboard with chaining
export function fetchDashboardWithChaining(city: string): Promise<DashboardData> {
  return fetchWeather(city)
    .then((weather) =>
      fetchNews().then((news) => ({
        weather,
        news,
      })),
    )
    .catch((error) => {
      console.error("Failed to fetch chained dashboard data:", error);
      throw error;
    });
}

// Fastest request demo
export function fetchFastestRequest(city: string): Promise<string> {
  return Promise.race([
    fetchWeather(city).then(() => "Weather finished first"),
    fetchNews().then(() => "News finished first"),
  ]);
}
