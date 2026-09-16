import "dotenv/config";
import https from "node:https";
import promptSync from "prompt-sync";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_URL = "https://dummyjson.com/posts?limit=3";
const prompt = promptSync();
const city = prompt("Enter city name: ")?.trim() || "Polokwane";

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

function createFallbackWeather(city: string) {
  return {
    city,
    temperature: NaN,
    condition: "Weather unavailable",
  };
}

export function fetchWeatherWithCallback(
  city: string,
  callback: (error: Error | null, weather?: { city: string; temperature: number; condition: string }) => void,
): void {
  if (!WEATHER_API_KEY) {
    callback(new Error("Missing WEATHER_API_KEY in .env"));
    return;
  }

  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

  requestJson<{ main?: { temp?: number }; weather?: Array<{ description?: string }> }>(
    WEATHER_URL,
    (error, data) => {
      if (error || !data) {
        console.warn(`Weather API unavailable for ${city}; using fallback weather.`, error);
        callback(null, createFallbackWeather(city));
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

fetchDashboardWithCallback(city, (error, dashboard) => {
  if (error || !dashboard) {
    console.error("Callback Dashboard error:", error ?? new Error("Unknown error"));
    return;
  }

  console.log("Fetching weather and news...");
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
