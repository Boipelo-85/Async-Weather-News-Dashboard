import https from "node:https";
import type { DashboardData, NewsItem, WeatherData } from "./types.js";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&current=temperature_2m,weather_code&timezone=auto";
const NEWS_URL = "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=3";

function requestJson<T>(url: string, callback: (error: Error | null, data?: T) => void): void {
  https
    .get(url, (response) => {
      const chunks: Buffer[] = [];

      response.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      response.on("end", () => {
        try {
          const payload = Buffer.concat(chunks).toString("utf-8");
          callback(null, JSON.parse(payload) as T);
        } catch (error) {
          callback(error instanceof Error ? error : new Error("Failed to parse response"));
        }
      });
    })
    .on("error", (error) => {
      callback(error);
    });
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

export function fetchWeatherWithCallback(
  callback: (error: Error | null, weather?: WeatherData) => void,
): void {
  requestJson<{ current?: { temperature_2m?: number; weather_code?: number } }>(
    WEATHER_URL,
    (error, data) => {
      if (error || !data) {
        callback(error ?? new Error("Weather request returned no data"));
        return;
      }

      const weather: WeatherData = {
        city: "Johannesburg",
        temperature: data.current?.temperature_2m ?? 0,
        condition: getWeatherCondition(data.current?.weather_code),
      };

      callback(null, weather);
    },
  );
}

export function fetchNewsWithCallback(
  callback: (error: Error | null, news?: NewsItem[]) => void,
): void {
  requestJson<{ hits?: Array<{ title?: string; url?: string; author?: string }> }>(
    NEWS_URL,
    (error, data) => {
      if (error || !data) {
        callback(error ?? new Error("News request returned no data"));
        return;
      }

      const news = (data.hits ?? [])
        .slice(0, 3)
        .map((item) => ({
          source: item.author ?? "Hacker News",
          title: item.title ?? "Untitled story",
          ...(item.url ? { url: item.url } : {}),
        }));

      callback(null, news);
    },
  );
}

export function fetchDashboardWithCallback(
  callback: (error: Error | null, dashboard?: DashboardData) => void,
): void {
  fetchWeatherWithCallback((weatherError, weather) => {
    if (weatherError || !weather) {
      callback(weatherError ?? new Error("Weather fetch failed"));
      return;
    }

    fetchNewsWithCallback((newsError, news) => {
      if (newsError || !news) {
        callback(newsError ?? new Error("News fetch failed"));
        return;
      }

      callback(null, { weather, news });
    });
  });
}
