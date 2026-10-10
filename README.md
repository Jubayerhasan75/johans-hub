<h1 align="center">johans-hub</h1>

<p align="center">A full-stack ecommerce web application for a premium men's t-shirt brand — complete with product catalog, cart, checkout, order management and an admin dashboard.</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white">
</p>

---

## Overview

**johans-hub** is a production-grade MERN ecommerce store built with a modern React + TypeScript frontend and a secure Express + MongoDB REST API. It covers the full shopping journey — browsing, filtering, cart, checkout and order tracking — alongside a complete admin panel for managing the store.

## Features

**Storefront**
- Product catalog with search, category / colour / price filters and pagination
- Product detail pages with size & colour selection
- Shopping cart and favourites
- Multi-step checkout (Cash on Delivery and manual mobile payment)
- Customer accounts with order history

**Admin dashboard**
- Create, edit and delete products with image uploads
- Order management with status updates and sales statistics
- Editable homepage banners — no code required
- Role-based access control (admin vs. customer)

**Engineering**
- JWT authentication with hashed passwords
- Server-side price and stock validation
- Cloudinary image hosting
- Fully responsive UI with smooth animations
- Automated API tests

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary |

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local or Atlas)

### Installation

```bash
git clone https://github.com/Jubayerhasan75/johans-hub.git
cd johans-hub
npm run install:all
```

### Configuration

Copy the example env files and fill in your own values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Run

```bash
npm run dev:backend    # API  → http://localhost:5000
npm run dev:frontend   # App  → http://localhost:3000
```

## Project Structure

```
johans-hub/
├── frontend/   # React + Vite client (TypeScript, Tailwind)
└── backend/    # Express + MongoDB REST API
```

## License

Released under the [MIT License](LICENSE).
