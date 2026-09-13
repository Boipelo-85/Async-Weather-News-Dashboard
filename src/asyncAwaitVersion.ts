import "dotenv/config";

type Weather = {
  city: string;
  temperature: number;
  condition: string;
};

type NewsItem = {
  source: string;
  title: string;
};

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWeather(): Promise<Weather> {
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

  if (!NEWS_API_KEY) {
    throw new Error("Missing NEWS_API_KEY in .env");
  }

  return [
    {
      source: "BBC",
      title: "City council launches new climate resilience plan.",
    },
    {
      source: "Reuters",
      title: "Cooler evening temperatures expected this weekend.",
    },
  ];
}

export async function fetchDashboardData(): Promise<{ weather: Weather; news: NewsItem[] }> {
  try {
    console.log("Fetching weather and news...");

    const [weather, news] = await Promise.all([getWeather(), getNews()]);

    return { weather, news };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
}
