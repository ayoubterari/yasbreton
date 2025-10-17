# Quick Start - Centre Yasbreton

## Installation rapide

### 1. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

### 3. Accéder à l'application

Ouvrez http://localhost:3000 dans votre navigateur.

## Architecture

- **Backend** : Convex (serverless database + API)
- **Frontend** : React + Vite + TypeScript
- **Communication** : HTTP API via ConvexHttpClient

## Caractéristiques

✅ **Backend et Frontend complètement séparés**
- Pas de lien symbolique
- Pas de copie de fichiers
- Déploiement indépendant

✅ **Simple et maintenable**
- Architecture claire
- Facile à comprendre
- Facile à étendre

## Ajouter une nouvelle fonctionnalité

### Backend

Créez une nouvelle fonction dans `backend/convex/` :

```typescript
// backend/convex/users.ts
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
```

### Frontend

Ajoutez-la dans `frontend/src/lib/convex-client.ts` :

```typescript
export const api = {
  messages: { /* ... */ },
  users: {
    list: async () => {
      return await convexClient.query({ name: "users:list" } as any);
    },
  },
};
```

Utilisez-la dans vos composants :

```typescript
import { api } from './lib/convex-client'

const users = await api.users.list()
```

## Documentation complète

- `README.md` - Vue d'ensemble du projet
- `ARCHITECTURE.md` - Architecture détaillée
- `INSTALLATION.md` - Guide d'installation complet
- `backend/README.md` - Documentation backend
- `frontend/README.md` - Documentation frontend

## Support

- Convex Docs : https://docs.convex.dev
- React Docs : https://react.dev
- Vite Docs : https://vitejs.dev
