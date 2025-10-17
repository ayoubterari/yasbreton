# 🔧 Résolution de l'erreur 404 sur Vercel

## Problème
Vous obtenez une erreur **404 NOT_FOUND** lorsque vous accédez à votre application déployée sur Vercel.

## Causes possibles

### 1. Configuration du Root Directory incorrecte
Si votre projet est dans un sous-dossier (comme `frontend`), Vercel doit le savoir.

**Solution :**
1. Allez dans les paramètres de votre projet sur Vercel
2. Section "General" → "Root Directory"
3. Définissez : `frontend`
4. Sauvegardez et redéployez

### 2. Build Command incorrecte
Vercel doit savoir comment construire votre application.

**Solution :**
1. Paramètres du projet → "Build & Development Settings"
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`
5. Redéployez

### 3. Framework Preset incorrect
Vercel doit détecter que c'est un projet Vite.

**Solution :**
1. Paramètres → "Build & Development Settings"
2. **Framework Preset:** Sélectionnez "Vite"
3. Redéployez

### 4. Fichier vercel.json non pris en compte

**Vérification :**
```bash
# Assurez-vous que vercel.json est à la racine du dossier frontend
ls -la vercel.json
```

**Solution :**
1. Vérifiez que `vercel.json` contient :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. Commitez et poussez :
```bash
git add vercel.json
git commit -m "Fix: Add Vercel rewrites for SPA routing"
git push origin main
```

3. Vercel redéploiera automatiquement

### 5. Le build échoue silencieusement

**Vérification :**
1. Allez sur le dashboard Vercel
2. Cliquez sur votre déploiement
3. Consultez les logs de build
4. Cherchez des erreurs

**Solution si le build échoue :**
```bash
# Testez le build localement
npm run build

# Si ça échoue, corrigez les erreurs
# Puis commitez et poussez
```

## Solutions étape par étape

### Solution rapide (Recommandée)

1. **Vérifier la configuration sur Vercel :**
   - Root Directory: `frontend`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Forcer un redéploiement :**
   ```bash
   # Option 1: Via le dashboard
   # Allez sur Vercel → Deployments → ... → Redeploy
   
   # Option 2: Via un commit vide
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

3. **Vérifier que vercel.json est bien commité :**
   ```bash
   git status
   git add vercel.json public/_redirects
   git commit -m "Add SPA routing configuration"
   git push origin main
   ```

### Solution complète (Si la rapide ne fonctionne pas)

1. **Supprimer et recréer le projet sur Vercel :**
   - Allez sur Vercel Dashboard
   - Paramètres du projet → "Advanced" → "Delete Project"
   - Recréez le projet en important à nouveau depuis GitHub
   - **IMPORTANT:** Lors de la configuration :
     - Root Directory: `frontend`
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`

2. **Ajouter les variables d'environnement :**
   ```
   VITE_CONVEX_URL=https://your-convex-url.convex.cloud
   ```

3. **Déployer**

## Vérifications post-déploiement

### 1. Vérifier les logs de build
```bash
# Via CLI
vercel logs

# Ou sur le dashboard Vercel
```

### 2. Tester les routes
- Page d'accueil : `https://your-app.vercel.app/`
- Route formations : `https://your-app.vercel.app/formations`
- Route dashboard : `https://your-app.vercel.app/dashboard`

### 3. Vérifier la console navigateur
Ouvrez les DevTools (F12) et vérifiez :
- Onglet Console : Pas d'erreurs JavaScript
- Onglet Network : Tous les fichiers se chargent (200 OK)

## Commandes de diagnostic

```bash
# 1. Vérifier que le build fonctionne localement
npm run build

# 2. Tester le build localement
npm run preview
# Ouvrez http://localhost:3000 et testez les routes

# 3. Vérifier les fichiers de configuration
cat vercel.json
cat vite.config.ts

# 4. Vérifier les logs Vercel
vercel logs --follow

# 5. Lister les déploiements
vercel ls
```

## Configuration Vercel via CLI

Si vous préférez configurer via CLI :

```bash
# 1. Se connecter
vercel login

# 2. Lier le projet
cd frontend
vercel link

# 3. Configurer les paramètres
vercel env add VITE_CONVEX_URL production

# 4. Déployer
vercel --prod
```

## Cas particuliers

### Si vous utilisez un monorepo
Assurez-vous que :
- Le Root Directory pointe vers `frontend`
- Le `vercel.json` est dans le dossier `frontend`

### Si vous avez plusieurs projets
Chaque projet doit avoir son propre `vercel.json` dans son dossier racine.

### Si vous utilisez des routes dynamiques
React Router devrait fonctionner avec la configuration `vercel.json` fournie.

## Toujours pas résolu ?

### Vérifier la structure du projet
```
frontend/
├── index.html          ← Doit être ici
├── vercel.json         ← Doit être ici
├── vite.config.ts      ← Doit être ici
├── package.json        ← Doit être ici
├── src/
│   ├── main.tsx
│   └── App.tsx
└── public/
    └── _redirects      ← Fichier de secours
```

### Contacter le support
Si rien ne fonctionne :
1. Vérifiez les logs de build sur Vercel
2. Copiez l'erreur exacte
3. Contactez le support Vercel : https://vercel.com/support
4. Fournissez :
   - L'URL du projet
   - Les logs de build
   - Votre configuration (vercel.json, vite.config.ts)

## Ressources

- [Documentation Vercel - SPA Fallback](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [Documentation Vite - Deploying](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel Support](https://vercel.com/support)

---

**Note :** Après chaque modification, attendez que le déploiement soit terminé (2-3 minutes) avant de tester.
