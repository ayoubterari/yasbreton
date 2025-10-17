# Architecture du Projet

## Vue d'ensemble

Ce projet utilise une **architecture découplée** où le backend et le frontend sont complètement séparés.

```
┌─────────────────────────────────────────────────────────┐
│                     BACKEND (Convex)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  convex/                                           │ │
│  │  ├── schema.ts          (Schéma de données)       │ │
│  │  ├── messages.ts        (Queries & Mutations)     │ │
│  │  └── _generated/        (Types auto-générés)      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Expose une API HTTP via Convex Cloud                   │
│  URL: https://clear-pika-640.convex.cloud               │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP API
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  src/                                              │ │
│  │  ├── App.tsx            (Composant principal)     │ │
│  │  ├── main.tsx           (Point d'entrée)          │ │
│  │  └── lib/                                          │ │
│  │      └── convex-client.ts  (Client API)           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Consomme l'API via ConvexHttpClient                    │
└─────────────────────────────────────────────────────────┘
```

## Avantages de cette architecture

### ✅ Séparation complète
- Le frontend n'a **aucune dépendance** aux fichiers générés du backend
- Pas de lien symbolique nécessaire
- Pas de copie de fichiers entre backend et frontend

### ✅ Déploiement indépendant
- Le backend peut être déployé séparément sur Convex Cloud
- Le frontend peut être déployé sur n'importe quel hébergeur (Vercel, Netlify, etc.)
- Pas de couplage entre les déploiements

### ✅ Développement simplifié
- Chaque équipe peut travailler indépendamment
- Pas de synchronisation de fichiers nécessaire
- Interface claire via HTTP API

### ✅ Scalabilité
- Le backend peut servir plusieurs frontends (web, mobile, etc.)
- Facile d'ajouter de nouveaux clients
- API RESTful standard

## Comment ça fonctionne

### Backend (Convex)

Le backend expose des **queries** (lecture) et **mutations** (écriture) :

```typescript
// backend/convex/messages.ts
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const send = mutation({
  args: { text: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", { ...args, createdAt: Date.now() });
  },
});
```

Ces fonctions sont automatiquement exposées via l'API Convex.

### Frontend (React)

Le frontend utilise `ConvexHttpClient` pour appeler l'API :

```typescript
// frontend/src/lib/convex-client.ts
import { ConvexHttpClient } from "convex/browser";

const convexClient = new ConvexHttpClient(CONVEX_URL);

export const api = {
  messages: {
    list: async () => {
      return await convexClient.query({ name: "messages:list" });
    },
    send: async (text: string, author: string) => {
      return await convexClient.mutation({ 
        name: "messages:send", 
        args: { text, author } 
      });
    },
  },
};
```

### Utilisation dans les composants

```typescript
// frontend/src/App.tsx
import { api } from './lib/convex-client'

function App() {
  const loadMessages = async () => {
    const messages = await api.messages.list()
    setMessages(messages)
  }

  const handleSubmit = async () => {
    await api.messages.send(text, author)
    await loadMessages() // Recharger après l'envoi
  }
}
```

## Workflow de développement

### 1. Développer une nouvelle fonctionnalité

**Backend :**
1. Créer/modifier les fonctions dans `backend/convex/`
2. Tester avec `npm run dev`

**Frontend :**
1. Ajouter la fonction dans `frontend/src/lib/convex-client.ts`
2. Utiliser dans les composants React
3. Tester avec `npm run dev`

### 2. Pas de synchronisation nécessaire

Contrairement à l'approche avec types générés, **aucune synchronisation** n'est nécessaire entre backend et frontend.

### 3. Déploiement

**Backend :**
```bash
cd backend
npm run deploy
```

**Frontend :**
```bash
cd frontend
npm run build
# Déployer le dossier dist/ sur votre hébergeur
```

## Types TypeScript

### Backend
Le backend génère automatiquement ses types dans `convex/_generated/` pour son usage interne.

### Frontend
Le frontend définit ses propres types dans `convex-client.ts` :

```typescript
export interface Message {
  _id: string;
  _creationTime: number;
  text: string;
  author: string;
  createdAt: number;
}
```

Ces types sont **découplés** du backend et peuvent évoluer indépendamment.

## Comparaison avec l'approche "types générés"

| Aspect | Avec types générés | Sans types générés (actuel) |
|--------|-------------------|----------------------------|
| Dépendances | Frontend dépend du backend | Complètement découplé |
| Synchronisation | Nécessaire après chaque changement | Aucune |
| Lien symbolique | Requis (ou copie manuelle) | Non nécessaire |
| Déploiement | Couplé | Indépendant |
| Complexité | Plus élevée | Plus simple |
| Type safety | Automatique | Manuel |

## Recommandations

### Pour les petits projets
L'approche actuelle (sans types générés) est **recommandée** car :
- Plus simple à comprendre
- Moins de configuration
- Déploiement plus facile

### Pour les grands projets
Si vous avez besoin de type safety strict, vous pouvez :
1. Générer un fichier de types partagé
2. Le publier comme package npm
3. L'importer dans le frontend

Mais pour la plupart des cas, l'approche actuelle est suffisante.

## Fichiers importants

### Backend
- `backend/convex/schema.ts` - Définition du schéma
- `backend/convex/*.ts` - Queries et mutations
- `backend/.env.local` - Configuration (peut rester vide)

### Frontend
- `frontend/src/lib/convex-client.ts` - Client API (couche d'abstraction)
- `frontend/.env.local` - URL de l'API Convex
- `frontend/src/App.tsx` - Utilisation de l'API

## Évolution future

Cette architecture permet facilement de :
- Ajouter une application mobile qui consomme la même API
- Créer un dashboard admin séparé
- Migrer vers un autre framework frontend sans toucher au backend
- Ajouter un cache côté frontend (React Query, SWR, etc.)
