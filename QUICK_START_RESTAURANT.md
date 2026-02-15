# 🚀 Guide Rapide - Système Multi-Restaurant

## ✅ Ce qui a été fait

Ton application KITCH'N est maintenant un **système multi-restaurant** avec :
- Gestion d'équipe (chef + employés)
- Invitations par email
- Permissions strictes (chefs peuvent tout faire, employés peuvent seulement consulter)
- Isolation totale (chaque restaurant voit uniquement ses recettes)

---

## 📊 Structure de la base de données

### Tables ajoutées :
- ✅ `restaurants` : Gestion des restaurants
- ✅ `invitations` : Système d'invitation d'employés

### Tables modifiées :
- ✅ `profiles` : Ajout de `restaurant_id` et `restaurantRole`
- ✅ `recipes` : Ajout de `restaurant_id`

### Sécurité (RLS) :
- ✅ Chefs : peuvent créer/modifier/supprimer les recettes de leur restaurant
- ✅ Employés : peuvent SEULEMENT consulter les recettes de leur restaurant
- ✅ Isolation totale entre restaurants

---

## 🎯 Comment ça marche ?

### 1️⃣ Créer un restaurant (Inscription)

**Qui :** Tout nouveau utilisateur

**Comment :**
1. Page d'inscription
2. Remplir :
   - Nom complet
   - Email
   - Poste (Chef, Sous-Chef, etc.)
   - **Nom du Restaurant** ⭐ (obligatoire)
   - Mot de passe
3. Cliquer "Créer mon compte"

**Résultat :**
- Un restaurant est créé avec le nom fourni
- Tu deviens le **chef** de ce restaurant
- Tu peux inviter des employés

---

### 2️⃣ Inviter un employé

**Qui :** Chefs uniquement

**Comment :**
1. Connecte-toi en tant que chef
2. Clique sur l'onglet **"Équipe"** dans la navbar
3. Clique sur **"Inviter un employé"**
4. Saisis l'email de l'employé
5. Clique sur **"Envoyer l'invitation"**

**Résultat :**
- Une invitation est créée
- Un lien d'invitation est généré
- **IMPORTANT :** Pour l'instant, le lien s'affiche dans les **logs** (voir console navigateur ou logs Supabase)
- Copie ce lien et envoie-le à ton employé par email/SMS

**Exemple de lien :**
```
http://localhost:5173/invitation?token=a1b2c3d4e5f6...
```

---

### 3️⃣ Accepter une invitation

**Qui :** Employé invité

**Comment :**
1. Recevoir le lien d'invitation du chef
2. Cliquer sur le lien
3. Page d'inscription s'ouvre avec :
   - Email pré-rempli (non modifiable)
   - Nom du restaurant affiché
4. Remplir :
   - Nom complet
   - Poste (Cuisinier, Commis, etc.)
   - Mot de passe (2 fois)
5. Cliquer "Créer mon compte"

**Résultat :**
- Le compte est créé
- L'employé est rattaché au restaurant du chef
- Il a le rôle **"employee"** (lecture seule)
- Il est redirigé vers l'application

---

## 👥 Différences Chef vs Employé

### 👨‍🍳 CHEF (restaurantRole = 'chef')

**Peut faire :**
- ✅ Voir toutes les recettes du restaurant
- ✅ Créer des recettes
- ✅ Modifier des recettes
- ✅ Supprimer des recettes
- ✅ Importer des recettes avec l'IA
- ✅ Inviter des employés
- ✅ Voir l'onglet "Équipe"

**Navigation visible :**
```
Mes Recettes | Partagées | Groupes | Importer | Équipe
```

---

### 👨‍🍳 EMPLOYÉ (restaurantRole = 'employee')

**Peut faire :**
- ✅ Voir toutes les recettes du restaurant
- ✅ Lire les ingrédients
- ✅ Lire les instructions

**Ne peut PAS faire :**
- ❌ Créer des recettes
- ❌ Modifier des recettes
- ❌ Supprimer des recettes
- ❌ Importer des recettes
- ❌ Inviter d'autres employés
- ❌ Voir l'onglet "Équipe"

**Navigation visible :**
```
Mes Recettes | Partagées | Groupes
```

---

## 🔐 Sécurité (RLS)

Toutes les permissions sont **enforcées côté base de données** via Row Level Security (RLS).

**Cela signifie :**
- Même si un employé trouve un moyen de contourner l'interface, il ne pourra PAS modifier les données
- Les RLS policies bloquent toute action non autorisée directement dans Postgres
- Impossible de voir les recettes d'un autre restaurant
- Impossible de modifier si tu n'es pas chef

---

## 📁 Nouveaux Fichiers Créés

### Base de données :
```
supabase/migrations/20251120000001_add_restaurant_management.sql
```
- Crée les tables `restaurants` et `invitations`
- Modifie `profiles` et `recipes`
- Configure toutes les RLS policies

### Edge Function :
```
supabase/functions/send-invitation/index.ts
```
- Crée les invitations
- Génère les tokens sécurisés
- Simule l'envoi d'email (affiche dans les logs)

### Composants React :
```
src/components/Team/TeamManagement.tsx
```
- Page de gestion d'équipe (visible aux chefs uniquement)
- Liste des membres
- Invitations en attente
- Formulaire pour inviter

```
src/components/Auth/InvitationSignup.tsx
```
- Page d'inscription via invitation
- Accessible via /invitation?token=XXX
- Création du compte employé

---

## 🧪 Test Rapide

### Test 1 : Créer un restaurant
```
1. Déconnecte-toi
2. Va sur "Créer un compte"
3. Nom: "Chef Marie"
4. Email: "marie@test.fr"
5. Poste: "Chef"
6. Restaurant: "Chez Marie"
7. Mot de passe: "test123"
8. ✅ Tu es maintenant chef de "Chez Marie"
```

### Test 2 : Inviter un employé
```
1. Connecté comme Marie
2. Va dans "Équipe"
3. Clique "Inviter un employé"
4. Email: "jean@test.fr"
5. Clique "Envoyer"
6. ✅ Récupère le lien dans la console (F12)
7. Copie le lien
```

### Test 3 : Accepter l'invitation
```
1. Ouvre un navigateur privé
2. Colle le lien d'invitation
3. Nom: "Jean Martin"
4. Poste: "Commis"
5. Mot de passe: "test123"
6. ✅ Tu es maintenant employé de "Chez Marie"
7. ✅ Tu vois les recettes mais pas l'onglet "Équipe"
```

---

## ⚠️ Limitations Actuelles

### 1. Emails pas vraiment envoyés
**Problème :** Les emails sont juste affichés dans les logs

**Solution temporaire :**
- Copie le lien dans les logs
- Envoie-le manuellement à l'employé

**Pour envoyer de vrais emails (plus tard) :**
- Configure Resend ou SendGrid
- Ajoute la clé API dans Supabase
- Modifie l'Edge Function

### 2. Boutons visibles pour les employés
**Problème :** Les boutons "Éditer", "Supprimer" sont affichés même pour les employés

**Ce qui se passe :**
- Les employés voient les boutons
- Mais ils ne peuvent PAS les utiliser (RLS bloque)
- C'est sécurisé, juste pas optimisé UX

**Pour masquer les boutons (amélioration future) :**
```typescript
// Dans RecipeList.tsx et autres composants
{profile?.restaurantRole === 'chef' && (
  <button>Éditer</button>
)}
```

---

## 📞 En cas de problème

### Problème : "restaurant_id cannot be null"
**Solution :** Les anciennes données doivent être migrées
```sql
-- Vérifier si la migration a été appliquée
SELECT * FROM profiles WHERE restaurant_id IS NULL;

-- Si des profils n'ont pas de restaurant_id, réapplique la migration
```

### Problème : "Invitation invalide ou expirée"
**Causes possibles :**
- Le token est incorrect
- L'invitation a déjà été acceptée
- L'invitation a plus de 7 jours

**Solution :** Supprime l'invitation et crée-en une nouvelle

### Problème : "Seuls les chefs peuvent inviter"
**Cause :** Tu es connecté en tant qu'employé

**Solution :** Connecte-toi avec un compte chef

---

## 📚 Documentation Complète

Pour tous les détails techniques, voir :
```
RESTAURANT_SYSTEM.md
```

Ce fichier contient :
- Schema complet de la base de données
- Toutes les RLS policies expliquées
- Code des Edge Functions
- Workflow complet
- Points techniques avancés

---

## 🎉 C'est tout !

Ton système multi-restaurant est prêt à l'emploi !

**Prochaines étapes recommandées :**
1. Teste les 3 scénarios ci-dessus
2. Vérifie que les permissions fonctionnent
3. Regarde les logs pour voir les liens d'invitation
4. Crée plusieurs restaurants pour tester l'isolation

**Questions ? Problèmes ?**
- Vérifie la console navigateur (F12)
- Vérifie les logs Supabase
- Relis la documentation complète
