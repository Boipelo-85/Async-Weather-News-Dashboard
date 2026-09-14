import type { NewsItem } from "./news.js";

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
}

export interface DashboardData {
  weather: WeatherData;
  news: NewsItem[];
}
