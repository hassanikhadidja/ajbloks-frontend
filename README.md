# AJBloks — Next.js storefront + API

Full-stack toy store with a legacy HTML UI migrated to Next.js and a MongoDB API layer.

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in MongoDB (`uri`), JWT (`secretKey`), and Cloudinary credentials.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API (`/api/*`)

The Next.js app serves all backend routes under `/api`:

| Area | Endpoints |
|------|-----------|
| **Auth** | `POST /api/user/register`, `POST /api/user/login`, `GET /api/user/getcurrentuser` |
| **Users** | `GET /api/user` (admin), `PATCH/DELETE /api/user/[id]` |
| **Products** | `GET/POST /api/product`, `GET/PATCH/DELETE /api/product/[id]` |
| **Orders** | `POST /api/order`, `GET /api/order/config`, `GET /api/order/mine`, `GET /api/order/track`, admin CRUD on `/api/order/[id]` |
| **Reviews** | `GET/POST /api/review`, `PATCH/DELETE /api/review/[id]` |
| **Stores** | `GET/POST /api/store`, `PATCH/DELETE /api/store/[id]` |
| **Catalogues** | `GET/POST /api/catalogue`, `PATCH/DELETE /api/catalogue/[id]` |
| **Play content** | `GET/POST /api/play`, `PATCH/DELETE /api/play/[id]` |
| **Settings** | `GET/PUT /api/settings/promo-bar` |

JWT is sent as `Authorization: Bearer <token>` (stored in `localStorage` by `public/legacy/api-client.js`).

## Dashboard CMS

The admin dashboard at `/dashboard` uses `dashboard-admin.js` + `dashboard-integration.js` to sync Products, Users, Stores, Catalogues, Play content, Reviews, and promo bar settings with MongoDB.

Create an admin user directly in MongoDB (`role: "admin"`) or register then update the role in the database.

## Standalone Express backend

`BACKEND-DEPLOY-main/` mirrors the same API at `/api/*` (and legacy paths without prefix) for Netlify/serverless deployment. Use the same environment variables.

```bash
cd BACKEND-DEPLOY-main
npm install
npm run dev
```

## Product model

Products support both storefront fields (`sku`, `stock`, `category`, `img`) and dashboard CMS fields (`articles`, `whyLoveIt`, `qa`, `pictures`, `isBook`, etc.). The `lib/product-mapper.ts` module maps between dashboard and database shapes.
