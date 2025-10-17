# Backend Convex - Centre Yasbreton

## Installation

```bash
npm install
```

## Configuration

Le fichier `.env.local` contient l'URL de déploiement Convex :
```
CONVEX_DEPLOYMENT=https://clear-pika-640.convex.cloud
```

## Développement

```bash
npm run dev
```

## Déploiement

```bash
npm run deploy
```

## Structure

- `convex/` - Fonctions Convex (queries, mutations, actions)
- `convex/schema.ts` - Schéma de la base de données
- `convex/messages.ts` - Exemple de fonctions pour gérer les messages
