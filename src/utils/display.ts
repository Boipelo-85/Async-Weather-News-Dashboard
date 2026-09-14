import type { NewsItem } from "../types/news.js";
import type { WeatherData } from "../types/weather.js";

export function displayDashboard(weather: WeatherData, news: NewsItem[]): void {
  console.log(`Weather in ${weather.city}: ${weather.temperature}°C, ${weather.condition}`);
  console.log("Top stories:");

  news.forEach((item, index) => {
    const details = item.url ? `${item.title} (${item.url})` : item.title;
    console.log(`${index + 1}. ${item.source}: ${details}`);
  });
}
