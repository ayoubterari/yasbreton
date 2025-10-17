# Guide de Déploiement - Centre Yasbreton

## 📋 Checklist avant déploiement

- [ ] Le projet build sans erreurs (`npm run build`)
- [ ] Toutes les variables d'environnement sont documentées dans `.env.example`
- [ ] Le backend Convex est déployé et accessible
- [ ] Les tests locaux fonctionnent correctement

## 🚀 Déploiement sur Vercel

### Option 1 : Via l'interface web Vercel (Recommandé)

#### 1. Préparer le repository
```bash
# Assurez-vous que tout est commité
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Importer le projet sur Vercel
1. Allez sur https://vercel.com/new
2. Connectez votre compte GitHub/GitLab/Bitbucket
3. Sélectionnez le repository `centre-yasbreton`
4. Cliquez sur "Import"

#### 3. Configuration du projet
Dans les paramètres de configuration :

**Framework Preset:** Vite

**Root Directory:** `frontend` (important !)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Node Version:** 18.x ou supérieur

#### 4. Variables d'environnement
Ajoutez les variables suivantes dans l'onglet "Environment Variables" :

```
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

> ⚠️ **Important:** Remplacez `your-convex-deployment.convex.cloud` par votre URL Convex réelle

#### 5. Déployer
1. Cliquez sur "Deploy"
2. Attendez la fin du build (2-3 minutes)
3. Votre site sera accessible sur `https://your-project.vercel.app`

### Option 2 : Via Vercel CLI

#### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

#### 2. Se connecter à Vercel
```bash
vercel login
```

#### 3. Configurer le projet (première fois)
```bash
cd frontend
vercel
```

Répondez aux questions :
- Set up and deploy? **Y**
- Which scope? Sélectionnez votre compte
- Link to existing project? **N**
- Project name? `centre-yasbreton` (ou votre choix)
- In which directory is your code located? `./`
- Want to override settings? **Y**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Development Command: `npm run dev`

#### 4. Ajouter les variables d'environnement
```bash
vercel env add VITE_CONVEX_URL production
```

Entrez votre URL Convex quand demandé.

#### 5. Déployer en production
```bash
vercel --prod
```

## 🔄 Mises à jour automatiques

### Configuration GitHub Actions (Optionnel)

Créez `.github/workflows/deploy.yml` à la racine du projet :

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_CONVEX_URL: ${{ secrets.VITE_CONVEX_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

## 🔧 Configuration avancée

### Domaine personnalisé

1. Allez dans les paramètres du projet sur Vercel
2. Section "Domains"
3. Ajoutez votre domaine personnalisé
4. Suivez les instructions pour configurer les DNS

### Optimisations de performance

Le fichier `vercel.json` inclut déjà :
- ✅ Redirections SPA pour React Router
- ✅ Cache des assets statiques (1 an)
- ✅ Headers de sécurité

### Variables d'environnement par environnement

Vercel supporte 3 environnements :
- **Production** : Branche `main`
- **Preview** : Pull requests et autres branches
- **Development** : Développement local

Configurez des variables différentes pour chaque environnement si nécessaire.

## 🐛 Dépannage

### Erreur : "Build failed"
- Vérifiez que `npm run build` fonctionne localement
- Vérifiez les logs de build sur Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`

### Erreur : "404 Not Found" sur les routes
- Vérifiez que `vercel.json` contient les redirections SPA
- Le fichier devrait avoir `"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`

### Erreur : "VITE_CONVEX_URL is not defined"
- Vérifiez que la variable d'environnement est bien configurée sur Vercel
- Redéployez après avoir ajouté la variable

### Les assets ne se chargent pas
- Vérifiez les chemins dans votre code (utilisez des chemins relatifs)
- Assurez-vous que les fichiers sont dans le dossier `public` ou importés via JS

## 📊 Monitoring

### Analytics Vercel
Activez Vercel Analytics pour suivre :
- Temps de chargement
- Core Web Vitals
- Trafic et géolocalisation

### Logs
Consultez les logs en temps réel :
```bash
vercel logs
```

Ou sur le dashboard Vercel : https://vercel.com/dashboard

## 🔐 Sécurité

### Variables sensibles
- ❌ Ne commitez JAMAIS `.env.local`
- ✅ Utilisez `.env.example` pour documenter
- ✅ Configurez les variables sur Vercel directement

### HTTPS
- Vercel fournit automatiquement un certificat SSL
- Toutes les connexions sont en HTTPS

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Vite](https://vitejs.dev/guide/)
- [Documentation Convex](https://docs.convex.dev/)

## ✅ Vérification post-déploiement

Après le déploiement, vérifiez :
- [ ] Le site est accessible
- [ ] Toutes les pages se chargent correctement
- [ ] Les routes fonctionnent (pas de 404)
- [ ] Les appels API Convex fonctionnent
- [ ] Les images et assets se chargent
- [ ] Le site est responsive (mobile/desktop)
- [ ] Les formulaires fonctionnent
- [ ] L'authentification fonctionne

## 🎉 Félicitations !

Votre application est maintenant déployée et accessible au monde entier ! 🚀
