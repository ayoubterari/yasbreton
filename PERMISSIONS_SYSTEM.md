# Système de Gestion des Permissions Utilisateur

## Vue d'ensemble

Le système de permissions permet aux administrateurs de créer des utilisateurs avec des accès restreints au tableau de bord administratif. Ces utilisateurs peuvent accéder uniquement aux modules qui leur sont explicitement attribués.

## Fonctionnalités

### 1. Création d'utilisateurs restreints

Les administrateurs peuvent créer des utilisateurs avec un rôle "restricted" et sélectionner les modules auxquels ils auront accès :

- **Tableau de bord** : Vue d'ensemble de l'administration
- **Utilisateurs** : Gestion des comptes utilisateurs
- **Domaines** : Gestion des domaines et sous-domaines
- **Tâches** : Gestion des tâches
- **Formations** : Gestion des formations
- **Ressources** : Gestion des fichiers, catégories, tags et statistiques
- **Paramètres** : Configuration de l'application

### 2. Interface de gestion

L'interface se trouve dans la section **Paramètres** du tableau de bord administratif et permet de :

- Visualiser tous les utilisateurs restreints
- Créer de nouveaux utilisateurs avec permissions personnalisées
- Supprimer des utilisateurs restreints
- Voir les modules attribués à chaque utilisateur

## Architecture technique

### Frontend

#### Composants créés

1. **SettingsManagement.tsx**
   - Interface de gestion des utilisateurs restreints
   - Formulaire de création avec sélection des permissions
   - Liste des utilisateurs avec leurs permissions

2. **SettingsManagement.css**
   - Styles pour l'interface de gestion
   - Design moderne et responsive
   - Animations et transitions

#### Types TypeScript

```typescript
interface UserPermissions {
  dashboard: boolean
  users: boolean
  domains: boolean
  tasks: boolean
  formations: boolean
  resources: boolean
  settings: boolean
}

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  role: 'user' | 'admin' | 'restricted'
  permissions?: UserPermissions
  createdAt: number
}
```

#### API Client

Nouvelles fonctions ajoutées dans `convex-client.ts` :

- `api.admin.createRestrictedUser()` : Créer un utilisateur restreint
- `api.admin.updateUserPermissions()` : Mettre à jour les permissions

### Backend (Convex)

#### Schéma de base de données

Le schéma `users` a été étendu pour inclure :

```typescript
users: defineTable({
  // ... champs existants
  role: v.union(v.literal("user"), v.literal("admin"), v.literal("restricted")),
  permissions: v.optional(v.object({
    dashboard: v.boolean(),
    users: v.boolean(),
    domains: v.boolean(),
    tasks: v.boolean(),
    formations: v.boolean(),
    resources: v.boolean(),
    settings: v.boolean(),
  })),
  createdBy: v.optional(v.id("users")),
})
```

#### Fonctions backend

Nouvelles mutations dans `admin.ts` :

1. **createRestrictedUser**
   - Vérifie que le créateur est admin
   - Valide l'unicité de l'email
   - Crée l'utilisateur avec les permissions spécifiées

2. **updateUserPermissions**
   - Vérifie les droits d'administration
   - Met à jour les permissions d'un utilisateur restreint

## Utilisation

### Pour créer un utilisateur restreint

1. Connectez-vous en tant qu'administrateur
2. Accédez à **Paramètres** dans le menu latéral
3. Cliquez sur **Créer un utilisateur**
4. Remplissez les informations personnelles :
   - Prénom
   - Nom
   - Email
   - Téléphone
   - Mot de passe
5. Sélectionnez les modules auxquels l'utilisateur aura accès
6. Cliquez sur **Créer l'utilisateur**

### Connexion en tant qu'utilisateur restreint

Les utilisateurs restreints se connectent normalement via la page de connexion. Une fois connectés :

1. Sur la page d'accueil, ils verront un bouton **"Tableau de bord"** dans le header
2. En cliquant sur ce bouton, ils accèdent à `/restricted`
3. Le tableau de bord restreint affiche uniquement les modules auxquels ils ont accès
4. La navigation latérale ne montre que les sections autorisées
5. Toute tentative d'accès à un module non autorisé est bloquée

### Navigation pour les utilisateurs restreints

- **Page d'accueil** : Bouton "Tableau de bord" dans le header (icône avec grille)
- **Section Hero** : Bouton "Mon tableau de bord" redirige vers `/restricted`
- **Tableau de bord** : Menu latéral personnalisé selon les permissions
- **Routes protégées** : Accès uniquement aux modules autorisés

## Sécurité

- Seuls les administrateurs peuvent créer des utilisateurs restreints
- Les permissions sont vérifiées côté backend
- Les utilisateurs restreints ne peuvent pas modifier leurs propres permissions
- Les mots de passe sont stockés (en production, utilisez bcrypt pour le hashing)

## Évolutions futures possibles

1. **Permissions granulaires** : Ajouter des permissions plus fines (lecture seule, modification, suppression)
2. **Groupes d'utilisateurs** : Créer des groupes avec des permissions prédéfinies
3. **Audit log** : Tracer les actions des utilisateurs restreints
4. **Expiration des comptes** : Ajouter une date d'expiration pour les accès temporaires
5. **Notifications** : Alerter les utilisateurs lors de changements de permissions
6. **Interface de modification** : Permettre de modifier les permissions d'un utilisateur existant

## Notes de développement

- Le rôle "restricted" est distinct de "user" et "admin"
- Les permissions sont optionnelles et ne s'appliquent qu'aux utilisateurs restreints
- Le champ `createdBy` permet de tracer qui a créé chaque utilisateur restreint
- L'interface est entièrement responsive et fonctionne sur mobile

## Support

Pour toute question ou problème concernant le système de permissions, consultez la documentation technique ou contactez l'équipe de développement.
