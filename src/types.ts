export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
}

export interface NewsItem {
  source: string;
  title: string;
  url?: string;
}

export interface DashboardData {
  weather: WeatherData;
  news: NewsItem[];
}
