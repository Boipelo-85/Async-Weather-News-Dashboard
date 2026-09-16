import "dotenv/config";
import promptSync from "prompt-sync";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_URL = "https://dummyjson.com/posts?limit=3";
const prompt = promptSync();
const city = prompt("Enter city name: ")?.trim() || "Polokwane";

function createFallbackWeather(city: string) {
  return {
    city,
    temperature: NaN,
    condition: "Weather unavailable",
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchWeather(city: string) {
  if (!WEATHER_API_KEY) {
    console.warn(`Weather API unavailable for ${city}; using fallback weather.`);
    return Promise.resolve(createFallbackWeather(city));
  }

  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

  return fetchJson<{ main?: { temp?: number }; weather?: Array<{ description?: string }> }>(WEATHER_URL)
    .then((data) => ({
      city,
      temperature: data.main?.temp ?? 0,
      condition: data.weather?.[0]?.description ?? "Unknown",
    }))
    .catch((error) => {
      console.warn(`Weather API unavailable for ${city}; using fallback weather.`, error);
      return createFallbackWeather(city);
    });
}

export function fetchNews() {
  return fetchJson<{ posts?: Array<{ id?: number; title?: string; body?: string }> }>(NEWS_URL).then((data) =>
    (data.posts ?? []).slice(0, 3).map((item) => ({
      source: "DummyJSON",
      title: item.title ?? "Untitled post",
      ...(item.id !== undefined ? { url: `https://dummyjson.com/posts/${item.id}` } : {}),
    })),
  );
}

export function fetchDashboardWithPromiseAll(city: string) {
  return Promise.all([fetchWeather(city), fetchNews()])
    .then(([weather, news]) => ({ weather, news }))
    .catch((error) => {
      console.error("Failed to fetch dashboard data:", error);
      throw error;
    });
}

export function fetchDashboardWithChaining(city: string) {
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

export function fetchFastestRequest(city: string) {
  return Promise.race([
    fetchWeather(city).then(() => "Weather finished first"),
    fetchNews().then(() => "News finished first"),
  ]);
}

fetchDashboardWithPromiseAll(city)
  .then((dashboard) => {
    console.log("Fetching weather and news...");
    console.log("=== Promise.all Dashboard ===");
    console.log("{");
    console.log("  ==WEATHER==");
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
  })
  .catch((err) => console.error("Dashboard error (Promise.all):", err));

fetchDashboardWithChaining(city)
  .then((dashboard) => {
    console.log("Fetching weather and news...");
    console.log("=== Chaining Dashboard ===");
    console.log("{");
    console.log("  == WEATHER ==");
    console.log("city:", JSON.stringify(dashboard.weather.city));
    console.log("temperature:", dashboard.weather.temperature);
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
  })
  .catch((err) => console.error("Dashboard error (Chaining):", err));

fetchFastestRequest(city)
  .then((winner) => {
    console.log("Fetching weather and news...");
    console.log("=== Fastest Request ===");
    console.log(winner);
  })
  .catch((err) => console.error("Fastest request error:", err));
