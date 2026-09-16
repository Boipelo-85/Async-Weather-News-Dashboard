export class WeatherRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherRequestError";
  }
}

export function displayError(context: string, error: unknown): void {
  if (error instanceof WeatherRequestError) {
    console.error("City not found.");
    return;
  }

  const message = error instanceof Error ? error.message : String(error);

  console.error("\n=== ERROR ===");
  console.error(`Context: ${context}`);
  console.error(`Message: ${message}`);
  console.error("=============");
}