# Frontend React - Centre Yasbreton

Application React avec Vite qui consomme l'API Convex.

## Architecture

Le frontend est **complètement indépendant** du backend :
- Utilise `ConvexHttpClient` pour communiquer avec l'API
- Pas de dépendance aux fichiers générés du backend
- Pas de lien symbolique nécessaire

## Installation

```bash
npm install
```

## Configuration

Le fichier `.env.local` contient l'URL de l'API Convex :
```
VITE_CONVEX_URL=https://clear-pika-640.convex.cloud
```

## Développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Build

```bash
npm run build
```

## Structure

- `src/main.tsx` - Point d'entrée React
- `src/App.tsx` - Composant principal
- `src/App.css` - Styles de l'application
- `src/lib/convex-client.ts` - Client API Convex (couche d'abstraction)

## Ajouter une nouvelle API

Pour consommer une nouvelle fonction Convex :

1. Ajoutez la fonction dans `src/lib/convex-client.ts` :

```typescript
export const api = {
  messages: {
    // Fonctions existantes...
  },
  users: {
    getAll: async () => {
      return await convexClient.query({ name: "users:getAll" } as any);
    },
  },
};
```

2. Utilisez-la dans vos composants :

```typescript
import { api } from './lib/convex-client'

const users = await api.users.getAll()
```

## Déploiement sur Vercel

### Prérequis
- Un compte Vercel (https://vercel.com)
- Le projet poussé sur GitHub/GitLab/Bitbucket

### Étapes de déploiement

1. **Connectez votre repository**
   - Allez sur https://vercel.com/new
   - Importez votre repository GitHub

2. **Configuration du projet**
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Variables d'environnement**
   Ajoutez dans les paramètres Vercel :
   ```
   VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel construira et déploiera automatiquement votre application

### Déploiement via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Configuration automatique

Le fichier `vercel.json` est déjà configuré avec :
- Redirections SPA (Single Page Application)
- Cache optimisé pour les assets
- Configuration du build

### Mises à jour automatiques

Une fois configuré, chaque push sur la branche principale déclenchera automatiquement un nouveau déploiement.
