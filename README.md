# Async Weather News Dashboard

This project demonstrates different async patterns for fetching weather and news data:

- Callback-based version
- Promise-based version
- Async/Await version

## Features

- Fetches current weather data for Polokwane using OpenWeatherMap
- Fetches a few sample posts from DummyJSON
- Shows how async JavaScript can be handled in different styles
- Includes fallback behavior when weather requests fail

## Project Structure

- `src/callbackVersion.ts` — callback-based implementation
- `src/promiseVersion.ts` — Promise-based implementation
- `src/asyncAwaitVersion.ts` — async/await implementation
- `src/types/` — type definitions (if present in your version)
- `src/utils/` — helper utilities (if present in your version)

## Install dependencies

```bash
npm install
```

## Run the versions

### Callback version

```bash
npm run callback
```

### Promise version

```bash
npm run promise
```

### Async/Await version

```bash
npm run async
 
 Output is: 
 Fetching weather and news...
=== Callback Dashboard ===
{
  ==WEATHER==
    city: "Polokwane"
    temperature: 27.81
    condition: "clear sky"
  news: [
    {
      source: "DummyJSON"
      title: "His mother had always taught him"
    },
    {
      source: "DummyJSON"
      title: "He was an expert but not in a discipline"
    },
    {
      source: "DummyJSON"
      title: "Dave watched as the forest burned up on the hill."
    },
  ]
}
```

## Notes

- The app expects a `.env` file with a valid `WEATHER_API_KEY`.
- News data is fetched from DummyJSON.
- Weather requests use Polokwane coordinates: latitude `-23.9` and longitude `29.45`.

## Author

- **Name:** Boipelo Harry Motileng
- **GitHub:** [github.com/boipelo](https://github.com/Boipelo-85)
- **LinkedIn:** [linkedin.com/in/boipelo](https://www.linkedin.com/in/boipelo-motileng)
---
