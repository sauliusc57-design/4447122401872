# Plans?

**Plans?** is a trip planning mobile application built to help people track their upcoming trips, plan activities, and upload memories for each trip they go on. It is my take on the holiday / trip planner app — you can browse upcoming and past journeys, log activities with time metrics, set goals, and keep a photo diary for each trip.

Built with **React Native**, **Expo**, **Drizzle ORM**, and **SQLite**.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npx expo start
```

### Option A — Expo published update (recommended)

Open the link below in a browser on your phone, or scan the QR code on that page with Expo Go:

**https://expo.dev/accounts/sauliuscomber/projects/4447122401872/updates/f16ef536-63bf-4294-9cb3-9afe477bb7db**

> Download Expo Go first if you don't have it: https://expo.dev/go

### Option B — run locally

In the terminal output you will see a QR code. Scan it with the **Expo Go** app (available on iOS and Android) to open the project on your device.

- iOS: open the Camera app and point it at the QR code
- Android: open Expo Go and tap **Scan QR code**

---

## Demo / Seeded Account

The database is seeded automatically on first launch. You can log straight in with the following credentials — no registration needed:

| Field    | Value              |
|----------|--------------------|
| Email    | demo@planner.com   |
| Password | demo123            |

The seeded account includes:

- Three upcoming trips (Paris, Rome, London) with planned and completed activities
- Five past trips (Paris, London, Rome, Barcelona, Berlin) with sample photos
- Trip categories, activity targets, and time metrics pre-populated

---

## Environment Variables

No environment variables are required to run the app. The database is local (SQLite via `expo-sqlite`) and all data lives on-device.

---

## Scripts

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `npm start`           | Start the Expo development server    |
| `npx expo start`      | Same as above                        |
| `npm run android`     | Start on Android emulator            |
| `npm run ios`         | Start on iOS simulator               |
| `npm run typecheck`   | Run TypeScript type checking         |
| `npm test`            | Run the test suite                   |
| `npm run db:generate` | Regenerate Drizzle ORM migrations    |

---

## Tech Stack

| Technology                  | Purpose                              |
|-----------------------------|--------------------------------------|
| React Native + Expo         | Cross-platform mobile framework      |
| Expo Router                 | File-based navigation                |
| Drizzle ORM + expo-sqlite   | Local relational database            |
| React Native Reanimated     | Animations and gesture handling      |
| React Native Chart Kit      | Activity graphs and statistics       |
| Expo Image Picker           | Upload photos from device gallery    |
