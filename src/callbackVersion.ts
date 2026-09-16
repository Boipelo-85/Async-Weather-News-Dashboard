import "dotenv/config";
import https from "node:https";
import promptSync from "prompt-sync";
import { displayError, WeatherRequestError } from "./utils/displayError.js";

//API URL AND DummyJSON posts
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_URL = "https://dummyjson.com/posts?limit=3";

//creating a prompt for a user location
const prompt = promptSync();
const city = prompt("Enter city name: ").trim();

function requestJson<T>(url: string, callback: (error: Error | null, data?: T) => void): void {
  https
    .get(url, (response) => {
      const chunks: Buffer[] = [];

      if (response.statusCode !== undefined && response.statusCode >= 400) {
        response.resume();
        callback(new Error(`Request failed with HTTP ${response.statusCode}`));
        return;
      }

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

//Fetch weather  for the specific location section
export function fetchWeatherWithCallback(
  city: string,
  callback: (error: Error | null, weather?: { city: string; temperature: number; condition: string }) => void,
): void {
  if (!WEATHER_API_KEY) {
    callback(new WeatherRequestError("Missing WEATHER_API_KEY in .env"));
    return;
  }

  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

  requestJson<{ main?: { temp?: number }; weather?: Array<{ description?: string }> }>(
    WEATHER_URL,
    (error, data) => {
      if (error || !data) {
        callback(new WeatherRequestError(`Weather request failed for "${city}"`));
        return;
      }

      const weather = {
        city,
        temperature: data.main?.temp ?? 0,
        condition: data.weather?.[0]?.description ?? "Unknown",
      };

      callback(null, weather);
    },
  );
}

//Fetch the updated news from the DummyJSON posts
export function fetchNewsWithCallback(
  callback: (error: Error | null, news?: Array<{ source: string; title: string; url?: string }>) => void,
): void {
  requestJson<{ posts?: Array<{ id?: number; title?: string }> }>(NEWS_URL, (error, data) => {
    if (error || !data) {
      callback(error ?? new Error("News request returned no data"));
      return;
    }

    const news = (data.posts ?? [])
      .slice(0, 3)
      .map((item) => ({
        source: "DummyJSON",
        title: item.title ?? "Untitled post",
        ...(item.id !== undefined ? { url: `https://dummyjson.com/posts/${item.id}` } : {}),
      }));

    callback(null, news);
  });
}

export function fetchDashboardWithCallback(
  city: string,
  callback: (error: Error | null, dashboard?: { weather: { city: string; temperature: number; condition: string }; news: Array<{ source: string; title: string; url?: string }> }) => void,
): void {
  fetchWeatherWithCallback(city, (weatherError, weather) => {
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

//Display the final data from the api and news posts
fetchDashboardWithCallback(city, (error, dashboard) => {
  if (error || !dashboard) {
    displayError("Callback Dashboard", error ?? new Error("Unknown error"));
    return;
  }

  
  console.log("=== Callback Dashboard ===");
  console.log("{");
  console.log("  == WEATHER ==");
  console.log("    city:", JSON.stringify(dashboard.weather.city));
  console.log("    temperature:", dashboard.weather.temperature);
  console.log("    condition:", JSON.stringify(dashboard.weather.condition));
  console.log("  news: [");
  dashboard.news.forEach((item) => {
    console.log("    {");
    console.log("      source:", JSON.stringify(item.source));
    console.log("      title:", JSON.stringify(item.title));
    console.log("    },");
  });
  console.log("  ]");
  console.log("}");
});
