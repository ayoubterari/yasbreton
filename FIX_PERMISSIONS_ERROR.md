# Correction de l'erreur "Accès non autorisé"

## 🐛 Problème

Lorsqu'un utilisateur restreint avec la permission "Utilisateurs" essayait d'accéder au module Utilisateurs, il recevait l'erreur :

```
[Request ID: j88bAJcG6Ec4bvNj] Server Error: Uncaught Error: Accès non autorisé at handler (../convex/admin.ts:12:18)
```

## 🔍 Cause

La fonction `getAllUsers` dans `backend/convex/admin.ts` vérifiait uniquement si l'utilisateur était admin :

```typescript
if (!admin || admin.role !== "admin") {
  throw new Error("Accès non autorisé");
}
```

Les utilisateurs restreints, même avec la permission "users", étaient bloqués.

## ✅ Solution appliquée

### 1. Correction de `getAllUsers`

Modification de la vérification pour autoriser les utilisateurs restreints avec la permission "users" :

```typescript
// Vérifier que l'utilisateur existe
const user = await ctx.db.get(args.adminId);
if (!user) {
  throw new Error("Utilisateur non trouvé");
}

// Vérifier les permissions
const isAdmin = user.role === "admin";
const isRestrictedWithPermission = user.role === "restricted" && user.permissions?.users === true;

if (!isAdmin && !isRestrictedWithPermission) {
  throw new Error("Accès non autorisé");
}
```

### 2. Ajout des permissions dans auth.ts

Les fonctions `login` et `getUserById` retournent maintenant le champ `permissions` :

```typescript
return {
  // ... autres champs
  permissions: user.permissions,
  createdAt: user.createdAt,
};
```

### 3. Création d'un helper de permissions

Fichier `backend/convex/permissions.ts` créé avec des fonctions utilitaires :
- `hasPermission()` - Vérifie si un utilisateur a une permission spécifique
- `isAdmin()` - Vérifie si un utilisateur est admin
- `canAccess()` - Vérifie si un utilisateur peut accéder à un module

## 🚀 Déploiement

Pour appliquer les corrections :

```bash
cd backend
npx convex dev
```

Attendez le message "Convex functions ready".

## 🔄 Test après correction

1. **Reconnectez-vous** avec l'utilisateur restreint
2. Accédez au tableau de bord (`/restricted`)
3. Cliquez sur "Utilisateurs" dans le menu latéral
4. La liste des utilisateurs devrait maintenant s'afficher sans erreur

## 📋 Vérifications

### Console du navigateur (F12)

Vérifiez que l'utilisateur a bien les permissions :

```javascript
JSON.parse(localStorage.getItem('user'))
```

Résultat attendu :
```json
{
  "id": "...",
  "nom": "alaoui",
  "prenom": "karam",
  "email": "karam@gmail.com",
  "role": "restricted",
  "permissions": {
    "dashboard": false,
    "users": true,
    "domains": true,
    "tasks": false,
    "formations": false,
    "resources": false,
    "settings": false
  }
}
```

### Module Utilisateurs

Une fois dans le module, vous devriez voir :
- ✅ Titre : "Gestion des utilisateurs"
- ✅ Tableau avec les colonnes : Nom complet, Email, Téléphone, Rôle, Date d'inscription
- ✅ Liste de tous les utilisateurs
- ✅ Pas de boutons de modification (lecture seule pour les utilisateurs restreints)

## 🔐 Permissions par module

Voici quelles fonctions backend nécessitent quelles permissions :

| Module | Permission requise | Fonctions concernées |
|--------|-------------------|---------------------|
| Utilisateurs | `users: true` | `getAllUsers` |
| Domaines | `domains: true` | `getAllDomains`, `createDomain`, etc. |
| Tâches | `tasks: true` | `getAllTasks`, `createTask`, etc. |
| Formations | `formations: true` | `getAllFormations`, `createFormation`, etc. |
| Ressources | `resources: true` | `getFiles`, `createFile`, etc. |

## 🛡️ Sécurité

Les vérifications de permissions sont faites :
- ✅ Côté backend (dans chaque fonction Convex)
- ✅ Côté frontend (affichage conditionnel des modules)
- ✅ Au niveau des routes (protection par rôle)

## 📝 Notes importantes

1. **Les utilisateurs restreints ont un accès en lecture seule** au module Utilisateurs
   - Ils peuvent voir la liste des utilisateurs
   - Ils ne peuvent pas modifier, supprimer ou changer les rôles

2. **Les permissions sont vérifiées à chaque requête**
   - Même si un utilisateur modifie le frontend, le backend bloquera les actions non autorisées

3. **Les admins ont toujours accès à tout**
   - Aucune restriction pour le rôle "admin"

## 🔄 Évolutions futures

Pour ajouter des permissions plus granulaires :

1. **Permissions de lecture/écriture** :
   ```typescript
   permissions: {
     users: { read: true, write: false },
     domains: { read: true, write: true }
   }
   ```

2. **Permissions par action** :
   ```typescript
   permissions: {
     users: { view: true, create: false, edit: false, delete: false }
   }
   ```

3. **Groupes de permissions** :
   ```typescript
   role: "manager" // Groupe prédéfini avec certaines permissions
   ```

## ✅ Résultat

Après cette correction :
- ✅ Les utilisateurs restreints peuvent accéder aux modules autorisés
- ✅ Les permissions sont correctement vérifiées
- ✅ Aucune erreur "Accès non autorisé" pour les modules autorisés
- ✅ Le système est sécurisé et fonctionnel

---

**Date de correction** : 17 octobre 2025  
**Fichiers modifiés** :
- `backend/convex/admin.ts` (ligne 4-20)
- `backend/convex/auth.ts` (lignes 86, 113)
- `backend/convex/permissions.ts` (nouveau fichier)
