# ✅ Checklist de Déploiement

## Avant de déployer

### 1. Code et Build
- [ ] Le code compile sans erreurs TypeScript
- [ ] `npm run build` réussit localement
- [ ] `npm run preview` fonctionne et l'app est accessible
- [ ] Tous les tests passent (si applicable)
- [ ] Pas de `console.log` ou code de debug en production

### 2. Configuration
- [ ] `.env.example` est à jour avec toutes les variables nécessaires
- [ ] `vercel.json` est présent et configuré
- [ ] `.gitignore` contient `node_modules`, `dist`, `*.local`
- [ ] `.vercelignore` est présent

### 3. Backend Convex
- [ ] Le backend Convex est déployé
- [ ] L'URL Convex de production est disponible
- [ ] Toutes les fonctions API nécessaires sont déployées
- [ ] Les données de test/production sont prêtes

### 4. Sécurité
- [ ] Aucune clé API ou secret dans le code
- [ ] Les variables sensibles sont dans `.env.local` (non commité)
- [ ] Les headers de sécurité sont configurés dans `vercel.json`

### 5. Performance
- [ ] Les images sont optimisées
- [ ] Les bundles sont raisonnables (vérifier avec `npm run build`)
- [ ] Le code splitting est configuré (voir `vite.config.ts`)

### 6. Git
- [ ] Tous les changements sont commités
- [ ] La branche est à jour avec `main`
- [ ] Le repository est poussé sur GitHub/GitLab

## Déploiement sur Vercel

### Première fois
- [ ] Compte Vercel créé et connecté à GitHub
- [ ] Projet importé sur Vercel
- [ ] Root directory configuré sur `frontend`
- [ ] Variables d'environnement ajoutées :
  - [ ] `VITE_CONVEX_URL`
- [ ] Premier déploiement lancé

### Déploiements suivants
- [ ] Code poussé sur GitHub
- [ ] Vercel déploie automatiquement (vérifier le dashboard)
- [ ] Build réussi (pas d'erreurs)

## Après le déploiement

### Tests de base
- [ ] Le site est accessible
- [ ] Page d'accueil se charge
- [ ] Navigation fonctionne (pas de 404)
- [ ] Les images se chargent

### Tests fonctionnels
- [ ] Connexion/Inscription fonctionne
- [ ] Les formations s'affichent
- [ ] Les ressources sont accessibles
- [ ] Le dashboard utilisateur fonctionne
- [ ] Le dashboard admin fonctionne (si applicable)
- [ ] Les paiements fonctionnent (mode test)

### Tests techniques
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Les appels API Convex fonctionnent
- [ ] Les redirections fonctionnent
- [ ] Le site est responsive (mobile/tablet/desktop)

### Performance
- [ ] Temps de chargement < 3 secondes
- [ ] Lighthouse score > 80
- [ ] Pas de ressources bloquantes

### SEO (si applicable)
- [ ] Meta tags présents
- [ ] Titre et description corrects
- [ ] Open Graph tags configurés

## En cas de problème

### Build échoue
1. Vérifier les logs sur Vercel
2. Tester `npm run build` localement
3. Vérifier les dépendances dans `package.json`
4. Vérifier la version de Node.js

### 404 sur les routes
1. Vérifier `vercel.json` - rewrites configurés ?
2. Vérifier React Router configuration
3. Tester en local avec `npm run preview`

### Variables d'environnement
1. Vérifier qu'elles sont ajoutées sur Vercel
2. Vérifier le nom (commence par `VITE_`)
3. Redéployer après ajout de variables

### API ne fonctionne pas
1. Vérifier l'URL Convex
2. Vérifier que le backend est déployé
3. Vérifier les CORS si applicable
4. Vérifier la console navigateur pour les erreurs

## Commandes utiles

```bash
# Vérifier avant déploiement
npm run pre-deploy

# Build local
npm run build

# Tester le build
npm run preview

# Déployer (avec vérifications)
npm run deploy

# Déployer directement
vercel --prod

# Voir les logs
vercel logs

# Voir les déploiements
vercel ls
```

## Ressources

- [Dashboard Vercel](https://vercel.com/dashboard)
- [Documentation Vercel](https://vercel.com/docs)
- [Support Vercel](https://vercel.com/support)
- [Documentation Convex](https://docs.convex.dev/)

---

**Dernière mise à jour :** $(date)
