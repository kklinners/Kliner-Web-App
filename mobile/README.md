# Kliner Mobile (React Native / Expo)

Native shell for **customers**: sign in, home, upcoming jobs, visit codes, bookings list. Booking wizards still open the **Next.js web app** in the browser until those flows are ported screen-by-screen.

## Requirements

- Node 20+
- [Expo Go](https://expo.dev/go) on your phone, or Xcode / Android Studio for simulators
- `kklinners-backend` running (port 3002)

## Setup

```bash
cd mobile
npm install
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL to your machine IP when using a real phone
npm start
```

Press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

## What’s ported vs web

| Feature | Mobile | Web |
|--------|--------|-----|
| Sign in | Native | Native |
| My bookings + visit code | Native | Native |
| Book a service (all steps) | Opens web | Full |
| Team field `/team/...` | Web link | Web |
| Admin | Web only | Web |

## Next build steps

1. Port `house-cleaning` (and other) booking flows into native screens.
2. Paystack: use WebView or deep link back to app (`kliner://booking-confirmation`).
3. Share `utils/ownerSafety.js` and pricing helpers via a small `packages/shared` workspace.
4. EAS Build for TestFlight / Play Store.

## Assets

Replace placeholder files in `assets/` with your app icon and splash (1024×1024 icon recommended).
