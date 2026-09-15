import "dotenv/config";
import type { NewsItem } from "./types/news.js";
import type { WeatherData } from "./types/weather.js";
import { displayError } from "./utils/display.js";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  throw new Error("Missing NEWS_API_KEY in .env");
}

const NEWS_URL = `https://newsapi.org/v2/top-headlines?country=za&pageSize=3&apiKey=${NEWS_API_KEY}`;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWeather(): Promise<WeatherData> {
  await delay(700);

  if (!WEATHER_API_KEY) {
    throw new Error("Missing WEATHER_API_KEY in .env");
  }

  return {
    city: "Johannesburg",
    temperature: 22,
    condition: "Sunny",
  };
}

async function getNews(): Promise<NewsItem[]> {
  await delay(400);

  const response = await fetch(NEWS_URL);

  if (!response.ok) {
    throw new Error(`News API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    articles?: Array<{ title?: string; url?: string; source?: { name?: string } }>;
  };

  return (data.articles ?? []).slice(0, 3).map((article) => ({
    source: article.source?.name ?? "News API",
    title: article.title ?? "Untitled story",
    ...(article.url ? { url: article.url } : {}),
  }));
}

export async function fetchDashboardData(): Promise<{ weather: WeatherData; news: NewsItem[] }> {
  try {
    console.log("Fetching weather and news...");

    const [weather, news] = await Promise.all([getWeather(), getNews()]);

    return { weather, news };
  } catch (error) {
    displayError("Async/Await Dashboard", error);
    throw error;
  }
}
