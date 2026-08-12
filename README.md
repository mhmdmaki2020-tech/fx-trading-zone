# Trading Community

A prototype trading community feed (text/image/video posts) with a bot control room for MetaTrader 5 auto-execution, copy-trading, and AI commentary. Currently runs entirely on mock data — no real MT5 connection yet.

## Run it locally

Requires [Node.js](https://nodejs.org) (v18+) installed.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Project structure

```
trading-community/
├── index.html          # HTML shell + Google Fonts (Fraunces, Inter, IBM Plex Mono)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx         # React entry point
    ├── App.jsx          # The whole app: feed, bot dashboard, profile
    └── index.css        # Tailwind imports
```

## What's real vs. mock right now

- **Real:** posting text/image/video to the feed, likes, the bot dashboard UI, mode toggles
- **Mock:** the ticker tape, the trade log table, and the "Connect MT5 account" button (it only flips UI state — no live broker session)

## Next steps to make the bot real

1. Build a backend service (Node or Python) with a real database for posts/users/media.
2. Bridge to MetaTrader 5 — either the Python `MetaTrader5` package (needs a Windows host running the MT5 terminal) or an MQL5 Expert Advisor exposing a socket/REST bridge.
3. Wire the frontend's "Connect" form to that backend instead of local state.
4. Before opening auto-trading or copy-trading to the public, check the regulatory requirements in your jurisdiction — this can trigger licensing obligations depending on where you and your users are.
