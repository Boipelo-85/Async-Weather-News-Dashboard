import "dotenv/config";
import promptSync from "prompt-sync";
import { displayError, WeatherRequestError } from "./utils/displayError.js";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_URL = "https://dummyjson.com/posts?limit=3";

//creating a prompt for a user location
const prompt = promptSync();
const city = prompt("Enter city name: ").trim();
 

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//Get user location weather section
async function getWeather(city: string) {
  await delay(700);

  try {
    if (!WEATHER_API_KEY) {
      throw new WeatherRequestError("Missing WEATHER_API_KEY in .env");
    }

    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(WEATHER_URL);

    if (!response.ok) {
      throw new WeatherRequestError(`Weather request failed for "${city}" (HTTP ${response.status})`);
    }

    const data = (await response.json()) as {
      main?: { temp?: number };
      weather?: Array<{ description?: string }>;
    };
    return {
      city,
      temperature: data.main?.temp ?? 0,
      condition: data.weather?.[0]?.description ?? "Unknown",
    };
  } catch (error) {
    throw error instanceof WeatherRequestError
      ? error
      : new WeatherRequestError(`Weather request failed for "${city}"`);
  }
}
//Get news from the DummyJSON post section
async function getNews() {
  const response = await fetch(NEWS_URL);

  if (!response.ok) {
    throw new Error(`News API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    posts?: Array<{ id?: number; title?: string }>;
  };

  return (data.posts ?? []).slice(0, 3).map((post) => ({
    source: "DummyJSON",
    title: post.title ?? "Untitled post",
    ...(post.id !== undefined ? { url: `https://dummyjson.com/posts/${post.id}` } : {}),
  }));
}
// Displaying structure of the weather and new section
export async function fetchDashboardData(city: string) {
  try {
    console.log(`Fetching weather for ${city}...`);

    const weather = await getWeather(city);
    const news = await getNews();

    return { weather, news };
  } catch (error) {
    throw error;
  }
}

//Display the final data from the api and news posts
void (async () => {
  try {
    const dashboard = await fetchDashboardData(city);
   
    console.log("=== Async/Await Dashboard ===");
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
  } catch (error) {
    displayError("Async/Await application", error);
  }
})();
