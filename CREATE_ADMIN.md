# Créer un compte administrateur

## Méthode 1 : Via le script d'initialisation (RECOMMANDÉ)

Le fichier `backend/convex/initAdmin.ts` a été créé pour faciliter la création d'un compte admin.

### Étapes :

1. Allez sur https://dashboard.convex.dev
2. Sélectionnez votre projet **yasbreton**
3. Allez dans l'onglet **"Functions"**
4. Cherchez la fonction `initAdmin:init`
5. Cliquez sur **"Run"** (pas besoin de paramètres)
6. Le système créera automatiquement un compte admin avec les identifiants par défaut

**Identifiants créés :**
- Email: `admin@centre-yasbreton.fr`
- Mot de passe: `admin123`

> ⚠️ Si un admin existe déjà, la fonction retournera un message indiquant qu'un admin existe déjà.

## Méthode 2 : Via la fonction createAdmin

Si vous voulez créer un admin avec des identifiants personnalisés :

1. Allez sur https://dashboard.convex.dev
2. Sélectionnez votre projet
3. Allez dans l'onglet "Functions"
4. Exécutez la fonction `admin:createAdmin` avec ces paramètres :

```json
{
  "email": "votre-email@exemple.fr",
  "password": "votre-mot-de-passe",
  "nom": "Votre Nom",
  "prenom": "Votre Prénom",
  "telephone": "0600000000"
}
```

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
