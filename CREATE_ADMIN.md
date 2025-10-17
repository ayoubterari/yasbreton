# Créer un compte administrateur

## Méthode 1 : Via la console Convex

1. Allez sur https://dashboard.convex.dev
2. Sélectionnez votre projet
3. Allez dans l'onglet "Functions"
4. Exécutez la fonction `admin:createAdmin` avec ces paramètres :

```json
{
  "email": "admin@centre-yasbreton.fr",
  "password": "admin123",
  "nom": "Admin",
  "prenom": "Centre",
  "telephone": "0600000000"
}
```

## Méthode 2 : Via le code (temporaire)

Vous pouvez créer un fichier temporaire pour initialiser l'admin :

```typescript
// backend/convex/initAdmin.ts
import { mutation } from "./_generated/server";

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    // Vérifier si un admin existe déjà
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    if (existingAdmin) {
      return { message: "Un admin existe déjà" };
    }

    // Créer le compte admin
    const adminId = await ctx.db.insert("users", {
      nom: "Admin",
      prenom: "Centre",
      email: "admin@centre-yasbreton.fr",
      password: "admin123", // À changer immédiatement !
      telephone: "0600000000",
      role: "admin",
      createdAt: Date.now(),
    });

    return { 
      message: "Admin créé avec succès",
      adminId 
    };
  },
});
```

Puis exécutez cette fonction une seule fois via la console Convex.

## Connexion admin

Une fois le compte créé :

1. Allez sur http://localhost:3000
2. Cliquez sur "Connexion"
3. Utilisez les identifiants :
   - Email: `admin@centre-yasbreton.fr`
   - Mot de passe: `admin123`

4. **IMPORTANT** : Changez immédiatement le mot de passe via votre dashboard !

## Accès au dashboard admin

Une fois connecté en tant qu'admin, vous verrez un bouton **"Admin"** dans le header.
Cliquez dessus pour accéder au dashboard d'administration.

## Sécurité

⚠️ **IMPORTANT** :
- Changez le mot de passe par défaut immédiatement
- En production, utilisez un hash pour les mots de passe (bcrypt)
- Ne partagez jamais les identifiants admin
