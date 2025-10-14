# Centre Yasbreton

Application full-stack avec backend Convex et frontend React.

## Structure du projet

```
centre-yasbreton/
├── backend/          # Backend Convex
│   ├── convex/       # Fonctions Convex (queries, mutations)
│   ├── .env.local    # Configuration Convex
│   └── package.json
│
└── frontend/         # Frontend React + Vite
    ├── src/          # Code source React
    ├── .env.local    # Configuration frontend
    └── package.json
```

## Installation

### 1. Backend Convex

```bash
cd backend
npm install
```

### 2. Frontend React

```bash
cd frontend
npm install
```


## Démarrage

### 1. Démarrer le backend Convex

```bash
cd backend
npm run dev
```

Lors du premier lancement, vous devrez vous authentifier avec Convex CLI.

### 2. Démarrer le frontend

Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Configuration

### Backend (.env.local)
```
CONVEX_DEPLOYMENT=https://clear-pika-640.convex.cloud
```

### Frontend (.env.local)
```
VITE_CONVEX_URL=https://clear-pika-640.convex.cloud
```

## Architecture

- **Backend et Frontend complètement séparés**
- Le backend expose une API Convex
- Le frontend consomme l'API via HTTP (pas de dépendance aux fichiers générés)
- Pas de lien symbolique ou copie de fichiers nécessaire

## Fonctionnalités

L'application de démonstration inclut :
- ✅ Système de messages
- ✅ API REST via Convex HTTP Client
- ✅ Queries Convex pour récupérer les données
- ✅ Mutations Convex pour créer des données
- ✅ Interface React moderne avec Vite
- ✅ TypeScript pour le backend et frontend
- ✅ Architecture découplée (backend/frontend indépendants)

## Développement

### Ajouter une nouvelle fonction Convex

**Backend :**
1. Créez un fichier dans `backend/convex/` (ex: `users.ts`)
2. Définissez vos queries/mutations
3. Exportez vos fonctions

**Frontend :**
1. Ajoutez la fonction dans `frontend/src/lib/convex-client.ts`
2. Appelez-la depuis vos composants React

Exemple :
```typescript
// backend/convex/users.ts
export const getUser = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// frontend/src/lib/convex-client.ts
export const api = {
  users: {
    getUser: async (id: string) => {
      return await convexClient.query({ name: "users:getUser", args: { id } } as any);
    },
  },
};
```

### Modifier le schéma de données

1. Éditez `backend/convex/schema.ts`
2. Les changements seront appliqués automatiquement en mode dev

## Déploiement

### Backend
```bash
cd backend
npm run deploy
```

### Frontend
```bash
cd frontend
npm run build
```

Les fichiers de production seront dans `frontend/dist/`
