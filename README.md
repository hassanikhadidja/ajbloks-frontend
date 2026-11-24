<p align="center">
  <img src="docs/hero.jpg" alt="AJ BLOKS — Clean Design. Fast Code. Real Results." width="100%" />
</p>

<h1 align="center">AJ BLOKS</h1>

<p align="center">
  <strong>Clean design. Fast code. Real results.</strong><br />
  La boutique de jouets algérienne — inventée pour le sourire des enfants,<br />
  construite pour la vitesse du web.
</p>

<p align="center">
  <a href="https://www.ajbloks.com">www.ajbloks.com</a>
  ·
  Jouets · Livres · DIY · Grossiste
</p>

---

## Pourquoi ce projet existe

AJ BLOKS n’est pas un clone figé. C’est une vitrine e-commerce full-stack : catalogue vivant, compte client, commande, magasin, activités DIY, et un dashboard CMS pour piloter le contenu sans toucher au code.

Un seul app Next.js. Une API sous `/api/*`. MongoDB derrière. Le fun devant.

---

## Stack

| Couche | Choix |
|--------|--------|
| Frontend | **Next.js 16** · **React 19** · TypeScript · Tailwind CSS 4 |
| Backend | Route Handlers Next.js (`/api/*`) |
| Base | **MongoDB** + Mongoose |
| Auth | JWT + bcrypt |
| Médias | Cloudinary |
| Email | Resend |

---

## Lancer en local

```bash
npm install
```

Crée un fichier `.env` à la racine (ou complète celui déjà présent) :

```env
uri=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/BackendDB
secretKey=your-jwt-secret
CLOUDINARY_NAME=
CLOUDINARY_APIKEY=
CLOUDINARY_APISECRET=
```

Puis :

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — promo bar, hero plage, et « Acheter maintenant » devraient déjà respirer.

---

## Ce que l’app sait faire

- **Storefront** — catégories, âge, personnages, nouveautés, PDP, panier, wishlist, checkout  
- **Compte** — inscription / connexion, profil, Kids Club, suivi de commande  
- **Contenu** — guides cadeaux, DIY, printables, Le monde de Bob  
- **Magasins** — trouver un magasin, cartes, coordonnées  
- **CMS** — `/dashboard` pour produits, users, stores, catalogues, play, reviews, promo bar  

Les routes publiques portent le préfixe marque : `/ajbloks-account`, `/ajbloks-gift-guides`, `/product-detail-page-ajbloks`, etc. Les anciennes URLs `toysrus-*` redirigent automatiquement.

---

## API (aperçu)

Tout vit sous `/api` :

| Domaine | Exemples |
|---------|----------|
| Auth | `POST /api/user/register` · `POST /api/user/login` · `GET /api/user/getcurrentuser` |
| Produits | `GET/POST /api/product` · `GET/PATCH/DELETE /api/product/[id]` |
| Commandes | `POST /api/order` · `GET /api/order/mine` · `GET /api/order/track` |
| Reviews · Stores · Catalogues · Play · Newsletter · Settings | CRUD sous leurs préfixes |

Auth : header `Authorization: Bearer <token>`.

---

## Admin

1. Ouvre `/dashboard`  
2. Connecte-toi avec un user `role: "admin"`  
3. Gère le catalogue, les magasins, le contenu Play et la barre promo  

---

## Structure (simplifiée)

```
app/           # pages + API routes
components/    # LegacyPage et UI partagée
lib/           # db, auth, models, mappers
public/        # assets, legacy JS, catalogues, printables
docs/hero.jpg  # image de couverture README
```

---

<p align="center">
  <em>Des jouets qui font sourire. Du code qui livre.</em><br />
  <strong>AJ BLOKS</strong>
</p>
