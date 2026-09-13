import { fetchDashboardData } from "./src/asyncAwaitVersion.js";

async function main(): Promise<void> {
  try {
    const dashboardData = await fetchDashboardData();
    console.log("Dashboard Overview:", dashboardData);
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
}

void main();
