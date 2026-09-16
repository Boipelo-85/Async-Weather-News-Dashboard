import "dotenv/config";
import promptSync from "prompt-sync";
import { displayError, WeatherRequestError } from "./utils/displayError.js";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_URL = "https://dummyjson.com/posts?limit=3";
const prompt = promptSync();
const city = prompt("Enter city name: ").trim();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchWeather(city: string) {
  if (!WEATHER_API_KEY) {
    return Promise.reject(new WeatherRequestError("Missing WEATHER_API_KEY in .env"));
  }

  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

  return fetchJson<{ main?: { temp?: number }; weather?: Array<{ description?: string }> }>(WEATHER_URL)
    .then((data) => ({
      city,
      temperature: data.main?.temp ?? 0,
      condition: data.weather?.[0]?.description ?? "Unknown",
    }))
    .catch(() => Promise.reject(new WeatherRequestError(`Weather request failed for "${city}"`)));
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
  return fetchWeather(city).then((weather) => Promise.all([Promise.resolve(weather), fetchNews()]))
    .then(([weather, news]) => ({ weather, news }));
}

export function fetchDashboardWithChaining(city: string) {
  return fetchWeather(city)
    .then((weather) =>
      fetchNews().then((news) => ({
        weather,
        news,
      })),
    );
}

export function fetchFastestRequest(city: string) {
  return fetchWeather(city).then(() =>
    Promise.race([
      Promise.resolve("Weather finished first"),
      fetchNews().then(() => "News finished first"),
    ]),
  );
}

//Display the final data from the api and news posts
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
  .catch((err) => displayError("Promise.all application", err));


fetchDashboardWithChaining(city)
  .then((dashboard) => {
 
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
  .catch((err) => displayError("Chaining application", err));

fetchFastestRequest(city)
  .then((winner) => {
    console.log("Fetching weather and news...");
    console.log("=== Fastest Request ===");
    console.log(winner);
  })
  .catch((err) => displayError("Fastest Request", err));
