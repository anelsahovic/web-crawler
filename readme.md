![demo-gif](https://github.com/user-attachments/assets/6a84786b-fb64-4e68-83df-577248034198)

# 🕸️ Web Crawler App

A full-stack web crawler application built with **Node.js**, **Express**, **Prisma**, **MySQL**, **React**, and **TypeScript**, fully containerized using **Docker**.

The app allows users to:

- Submit URLs for crawling
- Analyze and reanalyze URLs
- View metadata, status codes, and broken links
- Manage crawl queue
- See live crawling updates via WebSocket
- Visualize statistics via charts

---

## 📦 Tech Stack

### Backend

- Node.js + Express
- Prisma ORM + MySQL
- Socket.io (WebSocket updates)
- Zod for schema validation

### Frontend

- React + TypeScript
- Vite for bundling
- TailwindCSS + ShadCN + React Icons
- Recharts for visualizations

### DevOps

- Docker (frontend, backend, database)
- Prisma migrations and seed scripts

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/anelsahovic/web-crawler.git
cd web-crawler
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

✅ This will:

- Build the backend, frontend, and MySQL services
- Apply Prisma migrations
- Seed the database with initial test data
- Start the app at:

  - Frontend: [http://localhost:5173](http://localhost:5173)
  - Backend: [http://localhost:5001](http://localhost:5001)

---

## 🌱 Environment Variables

No need to create `.env` files manually — Docker provides them internally.

But for reference:

### `.env` (Backend)

```env
PORT=5001
DATABASE_URL="mysql://user:password@db:3306/crawlerdb"
AUTH_TOKEN="mysecrettoken123"
```

### `.env` (Frontend)

```env
VITE_API_URL='http://localhost:5001'
VITE_SECRET_TOKEN='mysecrettoken123'
```

---

## 🧠 Features

### ✅ Core Functionality

- Submit URLs for crawling (`POST /api/urls`)
- Queue URLs for later crawling (`POST /api/urls/queue`)
- Start crawling selected or queued URLs
- View results: status code, title, meta, broken links, etc.
- Reanalyze (recrawl) URLs
- Bulk delete and crawl selected URLs

### 📊 Dashboard & Analytics

- View stats: total crawled, broken URLs, etc.
- Pie charts showing broken status frequency

### 🔁 Real-Time WebSocket

- See live updates while URLs are being crawled

---

## 🛠️ Backend Routes

All API routes are prefixed with `/api/urls`.

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| GET    | `/`                 | Get all URLs           |
| GET    | `/queued`           | Get queued URLs        |
| GET    | `/stats`            | Get crawl statistics   |
| GET    | `/:urlId`           | Get single URL details |
| POST   | `/`                 | Crawl URL immediately  |
| POST   | `/queue`            | Add URL to queue       |
| PUT    | `/crawl-queued`     | Crawl all queued URLs  |
| PUT    | `/crawl-selected`   | Crawl selected URLs    |
| PUT    | `/:urlId/reanalyze` | Reanalyze a URL        |
| DELETE | `/:urlId`           | Delete a URL           |
| DELETE | `/`                 | Bulk delete URLs       |

---

## 📖 License

MIT

---

## 👤 Author

Anel – [LinkedIn](https://www.linkedin.com/in/anelsahovic/) | [GitHub](https://github.com/anelsahovic)

---
