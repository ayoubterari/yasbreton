# Guide d'installation - Centre Yasbreton

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Convex (gratuit)

## Étapes d'installation

### 1. Installation des dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configuration Convex

Le projet est déjà configuré avec votre URL Convex : `https://clear-pika-640.convex.cloud`

Les fichiers `.env.local` sont déjà créés dans les deux dossiers.

### 3. Authentification Convex (Première fois uniquement)

```bash
cd backend
npx convex dev
```

Lors du premier lancement :
1. Vous serez invité à vous connecter à Convex
2. Suivez les instructions dans le terminal
3. Sélectionnez votre projet existant ou créez-en un nouveau

### 4. Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

Attendez que le backend soit prêt (vous verrez "Convex functions ready").

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

### 5. Accéder à l'application

Ouvrez votre navigateur sur : http://localhost:3000

## Vérification

Si tout fonctionne correctement :
- ✅ Le backend Convex est connecté (vous verrez les logs dans le terminal)
- ✅ Le frontend charge sans erreur
- ✅ Vous pouvez envoyer et voir des messages en temps réel

## Problèmes courants

### Erreur de connexion Convex

**Solution :** Vérifiez que l'URL dans les fichiers `.env.local` est correcte :
```
Backend: CONVEX_DEPLOYMENT=https://clear-pika-640.convex.cloud
Frontend: VITE_CONVEX_URL=https://clear-pika-640.convex.cloud
```

### Port 3000 déjà utilisé

**Solution :** Modifiez le port dans `frontend/vite.config.ts`

## Commandes utiles

```bash
# Backend
cd backend
npm run dev      # Mode développement
npm run deploy   # Déploiement en production

# Frontend
cd frontend
npm run dev      # Mode développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
```

## Prochaines étapes

1. Explorez le code dans `backend/convex/messages.ts` pour comprendre les queries et mutations
2. Modifiez `frontend/src/App.tsx` pour personnaliser l'interface
3. Ajoutez de nouvelles tables dans `backend/convex/schema.ts`
4. Créez de nouvelles fonctions Convex selon vos besoins

## Support

- Documentation Convex : https://docs.convex.dev
- Documentation Vite : https://vitejs.dev
- Documentation React : https://react.dev
