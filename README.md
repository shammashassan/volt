<p align="center">
  <img src="https://shieldcn.dev/header/glow.svg?title=Volt&subtitle=Personal%20Knowledge%20Operating%20System&theme=zinc&logo=command" alt="Volt Header Banner" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/shammashassan/volt/stargazers"><img src="https://shieldcn.dev/github/stars/shammashassan/volt.svg?variant=secondary" alt="GitHub Stars" /></a>
  <a href="https://github.com/shammashassan/volt/commits/master"><img src="https://shieldcn.dev/github/last-commit/shammashassan/volt.svg?variant=secondary" alt="Last Commit" /></a>
  <a href="https://github.com/shammashassan/volt/pulls"><img src="https://shieldcn.dev/github/open-prs/shammashassan/volt.svg?variant=secondary" alt="Open PRs" /></a>
  <a href="https://github.com/shammashassan/volt/blob/master/LICENSE"><img src="https://shieldcn.dev/github/license/shammashassan/volt.svg?variant=secondary" alt="License" /></a>
</p>

> ⚠️ Volt is currently under active development. Features and APIs may change between releases.

---

## 🚀 About Volt

Volt is a **personal knowledge operating system** built for developers, design engineers, and curators. Traditional bookmarking systems let you hoard forgotten links; Volt shifts the focus to active curation—capturing context, establishing bidirectional links, detailing *why* items matter, and structuring custom structures matching your mental model.

Open your workspace, summon the Command Center with `Ctrl + K`, and instantly retrieve or link your digital resources.

---

## ✨ Features

- 🖥️ **Command Center Navigation**: Seamlessly navigate and search your entire digital workspace in milliseconds (`Ctrl + K`).
- 📁 **Structured Curation**: Save, organize, and group bookmarks and articles into custom **Categories & Collections**.
- 📝 **Bidirectional Linking**: Link **Resources** to custom **Projects**, **Notes**, and **People** to map relationships and map your second brain.
- 🎬 **Media Watchlist**: Track movies, series, and anime with real-time **TMDb** & **AniList** search integration and visual popover slider ratings.
- 📱 **Mobile Touch Optimization**: State-driven tap gestures separate preview activation from action triggers on mobile, avoiding clunky desktop hover bugs.
- 🛡️ **Multi-Tenant Security**: Private, authenticated user workspaces powered by **Better Auth**.

---

## 🛠️ Tech Stack

Volt is built with a premium, state-of-the-art developer stack:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Server Components (RSC)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose schemas with index optimizations)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Animations**: [GSAP](https://gsap.com/) & [Lenis Smooth Scroll](https://lenis.darkroom.engineering/)
---

## 📈 Activity & Stars

![Star History Chart](https://shieldcn.dev/chart/github/stars/shammashassan/volt.svg?theme=zinc)

---

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB installed locally or a MongoDB Atlas URI ready.

### 2. Environment Setup
Create a `.env` file in the root of the project and populate the following keys:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Better Auth Configuration
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# Client App URL (Required for client-side authentication redirects & API configuration)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Media Watchlist API Keys (Optional - for TMDb integration)
TMDB_API_KEY=your_tmdb_api_key
TMDB_READ_TOKEN=your_tmdb_read_token

# Upstash QStash (Required for background job scheduling & webhook verification)
QSTASH_URL=https://qstash-us-east-1.upstash.io
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_qstash_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_signing_key
```

### 3. Installation
Install dependencies and run the local development server:

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` or `⌘ + K` | Toggle Global Command Center (Search categories, notes, projects) |
| `Ctrl + M` or `⌘ + M` | Open Media Watchlist Search Dialog (TMDb / AniList proxy) |
| `Esc` | Close active dialog / popover |

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Volt • Built with ❤️ for design engineers and curators.</sub>
</p>
