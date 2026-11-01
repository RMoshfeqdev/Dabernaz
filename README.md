# Dabernaz Game Club — Responsive Persian PWA Prototype

**Personal project by Reza Moshfegh** · Vanilla JavaScript · HTML/CSS · Node.js · PWA

Dabernaz is a Persian, right-to-left, responsive game-club web app prototype. It includes a home view, game room, tournaments, referrals, a demo wallet, profile, settings, and support interface.

## Features

- Persian RTL user interface for mobile and desktop
- Single-page navigation between app views
- Demo Bingo, Poker, Slots, and memory games
- Local tournament registration interactions
- Profile-name editing and user settings
- Browser-local demo state persisted with `localStorage`
- PWA manifest and service worker for caching static assets
- Lightweight Node.js HTTP server with built-in modules only

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Node.js built-in `http`, `fs`, and `path` modules
- Web App Manifest and Service Worker
- `localStorage` for same-browser demo persistence

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm start
```

Open `http://localhost:8080`. To use another port:

```bash
PORT=8090 npm start
```

The app can also be launched in Termux after installing Node.js.

## Demo limitations

- Profile, virtual coins, and transaction history are stored only in the current browser's `localStorage`.
- There is no multi-user authentication, database, real-time multiplayer backend, online chat, or server-connected support desk.
- Payments and withdrawals are not implemented. All coins and prizes are virtual and have no cash value.
- This build demonstrates front-end interaction and PWA behavior; it is not a production gaming or payment service.

## Structure

```text
Dabernaz/
├── index.html
├── styles.css
├── app.js
├── server.js
├── manifest.webmanifest
├── sw.js
├── sw-register.js
└── icon.svg
```

## Author

**Reza Moshfegh** — Gilan, Iran
