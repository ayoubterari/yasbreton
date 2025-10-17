# Système d'Authentification - Centre Yasbreton

## Vue d'ensemble

Le système d'authentification permet aux utilisateurs de :
- ✅ S'inscrire avec leurs informations personnelles
- ✅ Se connecter avec email et mot de passe
- ✅ Accéder au dashboard après authentification
- ✅ Se déconnecter

## Architecture

### Backend (Convex)

**Schéma de données (`backend/convex/schema.ts`):**
```typescript
users: defineTable({
  nom: v.string(),
  prenom: v.string(),
  email: v.string(),
  password: v.string(),
  telephone: v.string(),
  createdAt: v.number(),
}).index("by_email", ["email"])
```

**Fonctions API (`backend/convex/auth.ts`):**
- `register` - Inscription d'un nouvel utilisateur
- `login` - Connexion d'un utilisateur
- `getUserById` - Récupérer un utilisateur par ID
- `checkEmailExists` - Vérifier si un email existe

### Frontend (React)

**Structure des composants:**
```
src/
├── contexts/
│   └── AuthContext.tsx        # Gestion de l'état d'authentification
├── components/
│   ├── Login.tsx              # Page de connexion
│   ├── Register.tsx           # Page d'inscription
│   ├── Dashboard.tsx          # Page principale (protégée)
│   ├── Auth.css               # Styles d'authentification
│   └── Dashboard.css          # Styles du dashboard
└── lib/
    └── convex-client.ts       # Client API avec fonctions auth
```

## Flux d'authentification

### 1. Inscription

**Données requises:**
- Nom
- Prénom
- Email
- Mot de passe (min 6 caractères)
- Confirmation du mot de passe
- Numéro de téléphone (10 chiffres)

**Validations:**
- Tous les champs sont obligatoires
- Email valide (format)
- Téléphone valide (10 chiffres)
- Mots de passe identiques
- Email unique (pas déjà utilisé)

**Processus:**
1. L'utilisateur remplit le formulaire
2. Validation côté client
3. Envoi à l'API backend
4. Vérification de l'unicité de l'email
5. Création du compte
6. Connexion automatique
7. Redirection vers le dashboard

### 2. Connexion

**Données requises:**
- Email
- Mot de passe

**Processus:**
1. L'utilisateur entre ses identifiants
2. Envoi à l'API backend
3. Vérification des credentials
4. Retour des informations utilisateur
5. Stockage dans localStorage
6. Redirection vers le dashboard

### 3. Session

**Gestion de la session:**
- Stockage dans `localStorage` (clé: `user`)
- Persistance entre les rechargements de page
- Context React pour l'état global
- Protection automatique des routes

**Déconnexion:**
- Suppression du localStorage
- Reset du context
- Redirection vers la page de connexion

## Utilisation

### Dans les composants

```typescript
import { useAuth } from '../contexts/AuthContext'

function MonComposant() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Vous devez être connecté</div>
  }
  
  return (
    <div>
      <p>Bonjour {user?.prenom} {user?.nom}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  )
}
```

### Appels API

```typescript
import { api } from './lib/convex-client'

// Inscription
const user = await api.auth.register({
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  password: 'motdepasse123',
  telephone: '0612345678'
})

// Connexion
const user = await api.auth.login({
  email: 'jean@example.com',
  password: 'motdepasse123'
})
```

## Sécurité

### ⚠️ Important - Production

Le code actuel stocke les mots de passe en clair. **Avant de déployer en production**, vous devez :

1. **Hasher les mots de passe** avec bcrypt ou argon2
2. **Utiliser HTTPS** pour toutes les communications
3. **Implémenter des tokens JWT** au lieu de localStorage
4. **Ajouter une limitation de tentatives** de connexion
5. **Implémenter la récupération** de mot de passe
6. **Ajouter la validation 2FA** (optionnel)

### Exemple avec bcrypt (à implémenter)

```typescript
// Backend - Inscription
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(args.password, 10)
await ctx.db.insert("users", {
  ...args,
  password: hashedPassword
})

// Backend - Connexion
const isValid = await bcrypt.compare(args.password, user.password)
if (!isValid) {
  throw new Error("Mot de passe incorrect")
}
```

## Améliorations possibles

### Court terme
- [ ] Validation email en temps réel
- [ ] Indicateur de force du mot de passe
- [ ] Messages de succès après inscription
- [ ] Animation de transition entre login/register

### Moyen terme
- [ ] Récupération de mot de passe par email
- [ ] Vérification d'email
- [ ] Profil utilisateur modifiable
- [ ] Photo de profil

### Long terme
- [ ] Authentification OAuth (Google, Facebook)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Gestion des sessions multiples
- [ ] Historique de connexion

## Tests

### Tester l'inscription

1. Accédez à http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire :
   - Nom: Test
   - Prénom: User
   - Email: test@example.com
   - Téléphone: 0612345678
   - Mot de passe: test123
   - Confirmation: test123
4. Cliquez sur "S'inscrire"
5. Vous devriez être redirigé vers le dashboard

### Tester la connexion

1. Déconnectez-vous
2. Entrez vos identifiants :
   - Email: test@example.com
   - Mot de passe: test123
3. Cliquez sur "Se connecter"
4. Vous devriez accéder au dashboard

### Tester la persistance

1. Connectez-vous
2. Rechargez la page (F5)
3. Vous devriez rester connecté

## Dépannage

### "Un utilisateur avec cet email existe déjà"
- L'email est déjà utilisé
- Essayez de vous connecter ou utilisez un autre email

### "Email ou mot de passe incorrect"
- Vérifiez vos identifiants
- Le mot de passe est sensible à la casse

### La session ne persiste pas
- Vérifiez que localStorage est activé dans votre navigateur
- Vérifiez la console pour les erreurs

### Erreur de connexion au backend
- Assurez-vous que le backend Convex est démarré
- Vérifiez l'URL dans `.env.local`

## API Reference

### `api.auth.register(data)`
Inscrit un nouvel utilisateur.

**Paramètres:**
- `nom` (string) - Nom de famille
- `prenom` (string) - Prénom
- `email` (string) - Adresse email
- `password` (string) - Mot de passe
- `telephone` (string) - Numéro de téléphone

**Retour:** `User` object

### `api.auth.login(data)`
Connecte un utilisateur.

**Paramètres:**
- `email` (string) - Adresse email
- `password` (string) - Mot de passe

**Retour:** `User` object

### `api.auth.getUserById(userId)`
Récupère les informations d'un utilisateur.

**Paramètres:**
- `userId` (string) - ID de l'utilisateur

**Retour:** `User` object ou `null`

### `api.auth.checkEmailExists(email)`
Vérifie si un email existe.

**Paramètres:**
- `email` (string) - Adresse email

**Retour:** `boolean`
