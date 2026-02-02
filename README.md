# 🏁 Ralli: Real-Time Scavenger Hunts

Ralli is a high-performance, real-time scavenger hunt platform designed for modern adventures. Built with **React**, **TypeScript**, and **Supabase**, it provides a seamless experience for both organizers and participants.

![Ralli UI](https://ralli.pages.dev/vite.svg)

## ✨ Features

- **🚀 Real-Time Leaderboards**: Live updates as teams progress through waypoints.
- **📸 Photo Submissions**: Participants upload proof of arrival, with automated image compression for speed.
- **📍 GPS Verification**: Precision-based check-ins ensures teams are exactly where they need to be.
- **🔒 Secure Architecture**: Hardened Row-Level Security (RLS) and protected organizer routes.
- **📱 PWA Ready**: Optimized for mobile performance and "app-like" experience.
- **🕵️ Hint System**: Unlock clues with point penalties to keep the game moving.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Static Analysis**: [Biome](https://biomejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/traali/Ralli.git
   cd Ralli
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📜 Principles & Governance

This project follows a strict **Development Constitution** focusing on:
- **Zero-Warning Linting**: Powered by Biome.
- **Safety First**: JWT-based security and atomic state transitions.
- **Resilience**: Network-aware photo uploads and GPS accuracy thresholds.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
*Created with ❤️ by the Ralli Team.*
