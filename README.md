# Landing Page Horizon GT

Landing page pour les demandes d'essai du SUV Horizon GT en Afrique de l'Ouest et Centrale.

## Structure du projet

- `src/` - Frontend React avec Vite
- `server/` - Backend Node.js avec Express et SQLite
- `public/` - Assets statiques

## Installation

```bash
npm install
cd server
npm install
cd ..
```

## Développement

### Lancer le frontend uniquement
```bash
npm run dev
```

### Lancer le backend uniquement
```bash
npm run dev:api
```

### Lancer les deux simultanément
```bash
npm run dev:all
```

Le frontend sera accessible sur http://localhost:5173
Le backend sera accessible sur http://localhost:3000

## Build pour production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

## Déploiement

### Frontend (Vercel)
Le frontend est configuré pour être déployé sur Vercel. Connectez votre repo GitHub à Vercel et le déploiement sera automatique.

### Backend (Options)
Le backend Node.js/Express peut être déployé sur plusieurs plateformes :

1. **Render** - https://render.com
2. **Railway** - https://railway.app
3. **Fly.io** - https://fly.io
4. **Heroku** - https://heroku.com

Pour le déploiement en production, vous devrez :
- Changer l'URL de l'API dans `src/App.jsx` (de `http://localhost:3000` à l'URL de production)
- Utiliser une base de données cloud (PostgreSQL, MySQL) au lieu de SQLite pour la production

## Base de données

En développement, une base de données SQLite est utilisée (`server/database.sqlite`).

Pour la production, il est recommandé d'utiliser :
- PostgreSQL (Render, Railway, Supabase)
- MySQL (PlanetScale, AWS RDS)

## API

### POST /api/submit
Enregistre une nouvelle demande d'essai.

Voir `server/README.md` pour plus de détails sur l'API.
# langing-page2
