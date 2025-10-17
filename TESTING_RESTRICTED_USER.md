# Guide de Test - Utilisateur Restreint

## ⚠️ IMPORTANT : Correction appliquée

Les fonctions backend `login` et `getUserById` ont été mises à jour pour inclure le champ `permissions`.

## 🔄 Étapes pour tester

### 1. Déployer les changements backend

Les modifications dans `backend/convex/auth.ts` doivent être déployées sur Convex :

```bash
cd backend
npx convex dev
```

Attendez que le message "Convex functions ready" apparaisse.

### 2. Tester avec l'utilisateur existant

#### Option A : Se reconnecter (Recommandé)

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** avec l'utilisateur restreint (karam@gmail.com)
3. Les permissions seront maintenant chargées correctement
4. Cliquez sur "Tableau de bord" dans le header
5. Vous devriez voir les modules "Utilisateurs" et "Domaines" dans le menu latéral

#### Option B : Rafraîchir la page

1. Restez connecté avec l'utilisateur restreint
2. **Rafraîchissez la page** (F5 ou Ctrl+R)
3. Le système rechargera automatiquement les données depuis la base de données
4. Les permissions devraient maintenant être visibles

### 3. Vérifier les modules

Une fois sur le tableau de bord restreint (`/restricted`), vous devriez voir :

✅ **Menu latéral** :
- Logo "Centre Yasbreton - Tableau de bord"
- Icône "Utilisateurs" (si permission activée)
- Icône "Domaines" (si permission activée)
- Bouton "Retour à l'accueil" en bas

✅ **Barre supérieure** :
- Titre du module actif
- Nom de l'utilisateur : "karam alaoui"
- Rôle : "Utilisateur restreint"
- Bouton de déconnexion

✅ **Contenu** :
- Module Utilisateurs : Liste des utilisateurs (lecture seule)
- Module Domaines : Gestion complète des domaines

### 4. Tester la navigation

1. Cliquez sur "Utilisateurs" dans le menu latéral
2. Vous devriez voir la liste des utilisateurs
3. Cliquez sur "Domaines"
4. Vous devriez voir l'interface de gestion des domaines
5. Essayez de créer/modifier un domaine pour vérifier les permissions

### 5. Créer un nouvel utilisateur restreint

Pour tester avec un utilisateur fraîchement créé :

1. Connectez-vous en tant qu'admin
2. Allez dans **Paramètres**
3. Cliquez sur **"Créer un utilisateur"**
4. Remplissez le formulaire :
   - Prénom : Test
   - Nom : User
   - Email : test@example.com
   - Téléphone : 0600000000
   - Mot de passe : test123
5. Sélectionnez les modules (ex: Tâches, Formations)
6. Cliquez sur **"Créer l'utilisateur"**
7. Déconnectez-vous
8. Connectez-vous avec test@example.com / test123
9. Cliquez sur "Tableau de bord"
10. Vérifiez que seuls les modules sélectionnés sont visibles

## 🐛 Dépannage

### Le menu latéral est toujours vide

**Cause** : Les permissions ne sont pas chargées

**Solutions** :
1. Vérifiez que Convex est bien déployé (`npx convex dev`)
2. Déconnectez-vous complètement
3. Reconnectez-vous
4. Vérifiez la console du navigateur (F12) pour les erreurs

### Les modules ne s'affichent pas

**Vérifications** :
1. Ouvrez la console du navigateur (F12)
2. Tapez : `JSON.parse(localStorage.getItem('user'))`
3. Vérifiez que l'objet contient un champ `permissions`
4. Exemple attendu :
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

### L'utilisateur voit tous les modules

**Cause** : L'utilisateur n'a pas le rôle "restricted"

**Solution** :
1. Vérifiez dans la base de données que le rôle est bien "restricted"
2. Recréez l'utilisateur si nécessaire

## ✅ Résultat attendu

Après avoir suivi ces étapes, l'utilisateur restreint devrait :

1. ✅ Voir un bouton "Tableau de bord" dans le header
2. ✅ Accéder à `/restricted` en cliquant dessus
3. ✅ Voir uniquement les modules autorisés dans le menu latéral
4. ✅ Pouvoir naviguer entre les modules autorisés
5. ✅ Être bloqué pour les modules non autorisés

## 📝 Notes

- Les permissions sont stockées dans `localStorage` après connexion
- Le système recharge automatiquement les données au rafraîchissement de la page
- Les routes sont protégées côté frontend ET backend
- Chaque action est vérifiée selon les permissions

## 🔐 Sécurité

- Les permissions sont vérifiées à chaque requête backend
- Le rôle "restricted" est distinct de "user" et "admin"
- Les utilisateurs ne peuvent pas modifier leurs propres permissions
- Toute tentative d'accès non autorisé est bloquée

---

**Si le problème persiste après ces étapes, vérifiez les logs de Convex et la console du navigateur pour identifier l'erreur exacte.**
