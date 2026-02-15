# 🏢 Système Multi-Restaurant - Documentation Complète

## 📋 Vue d'ensemble

Ton application KITCH'N a été transformée en un système multi-restaurant avec gestion d'équipe. Chaque restaurant fonctionne de manière indépendante avec son propre chef et ses employés.

---

## 🗄️ 1. MODIFICATIONS DE LA BASE DE DONNÉES

### Nouvelles Tables Créées

#### `restaurants`
Table principale pour gérer les restaurants.

```sql
CREATE TABLE restaurants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  owner_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz,
  updated_at timestamptz
);
```

**Colonnes :**
- `id` : Identifiant unique du restaurant
- `name` : Nom du restaurant
- `owner_user_id` : ID du chef/propriétaire du restaurant
- `created_at` / `updated_at` : Dates de création et mise à jour

#### `invitations`
Gestion des invitations d'employés.

```sql
CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  restaurant_id uuid REFERENCES restaurants(id),
  email text NOT NULL,
  role text DEFAULT 'employee',
  token text UNIQUE NOT NULL,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz
);
```

**Colonnes :**
- `id` : Identifiant unique de l'invitation
- `restaurant_id` : ID du restaurant qui invite
- `email` : Email de l'employé invité
- `role` : Rôle attribué (toujours 'employee' pour les invitations)
- `token` : Token sécurisé unique pour le lien d'invitation
- `expires_at` : Date d'expiration (7 jours après création)
- `accepted_at` : Date d'acceptation (NULL si pas encore acceptée)
- `created_at` : Date de création

### Tables Modifiées

#### `profiles`
Modifications apportées :

1. **Colonne renommée :**
   - `role` → `job_title` (pour garder Chef, Sous-Chef, etc.)

2. **Nouvelles colonnes ajoutées :**
   - `restaurant_id` (uuid, NOT NULL) : ID du restaurant de l'utilisateur
   - `restaurant_role` (text) : Rôle dans le restaurant ('chef' ou 'employee')

**Structure finale :**
```sql
profiles:
  - id (uuid, PK)
  - email (text)
  - full_name (text)
  - job_title (text) -- Ancien "role" : Chef, Sous-Chef, etc.
  - restaurant_id (uuid, FK) -- NOUVEAU
  - restaurantRole (text) -- NOUVEAU: 'chef' ou 'employee'
  - establishment (text, nullable)
  - created_at, updated_at
```

#### `recipes`
Modification apportée :

- `restaurant_id` (uuid, NOT NULL) : ID du restaurant propriétaire de la recette

**Structure finale :**
```sql
recipes:
  - id (uuid, PK)
  - user_id (uuid, FK)
  - restaurant_id (uuid, FK) -- NOUVEAU
  - title, category, servings, etc.
```

---

## 🔒 2. SÉCURITÉ (RLS - Row Level Security)

Toutes les policies RLS ont été refaites pour respecter le système multi-restaurant.

### Principe de base :
**Un utilisateur ne voit QUE les données de son restaurant.**

### Policies `restaurants`

| Action | Qui peut le faire | Condition |
|--------|-------------------|-----------|
| SELECT | Tous les utilisateurs authentifiés | Voir leur propre restaurant |
| INSERT | Tous les utilisateurs | Devient automatiquement owner |
| UPDATE | Owner uniquement | Seulement son restaurant |
| DELETE | Owner uniquement | Seulement son restaurant |

### Policies `recipes` (MISE À JOUR CRITIQUE)

| Action | Qui peut le faire | Condition |
|--------|-------------------|-----------|
| SELECT | Tous les membres du restaurant | `restaurant_id` correspond au restaurant de l'utilisateur |
| INSERT | **CHEFS uniquement** | `restaurantRole = 'chef'` |
| UPDATE | **CHEFS uniquement** | `restaurantRole = 'chef'` |
| DELETE | **CHEFS uniquement** | `restaurantRole = 'chef'` |

**⚠️ IMPORTANT :** Les employés ne peuvent QUE voir les recettes, jamais les modifier ni les créer.

### Policies `ingredients`

Même principe que les recettes :
- **SELECT** : Tous les membres du restaurant
- **INSERT/UPDATE/DELETE** : Chefs uniquement

### Policies `invitations`

| Action | Qui peut le faire | Condition |
|--------|-------------------|-----------|
| SELECT | Chefs uniquement | Voir les invitations de leur restaurant |
| INSERT | Chefs uniquement | Créer des invitations pour leur restaurant |
| DELETE | Chefs uniquement | Supprimer les invitations de leur restaurant |

---

## 🧭 3. FONCTIONS POSTGRESQL

### `is_restaurant_chef(user_id uuid)`

Fonction helper pour vérifier si un utilisateur est chef.

```sql
CREATE FUNCTION is_restaurant_chef(user_id uuid) RETURNS boolean
```

**Utilisation :**
```sql
SELECT is_restaurant_chef(auth.uid());
-- Retourne true si l'utilisateur est chef, false sinon
```

### `accept_invitation(invitation_token text, new_user_id uuid)`

Fonction pour accepter une invitation après la création du compte.

**Ce qu'elle fait :**
1. Vérifie que l'invitation existe et n'est pas expirée
2. Met à jour le profil de l'utilisateur avec le `restaurant_id` et `restaurant_role = 'employee'`
3. Marque l'invitation comme acceptée (`accepted_at = now()`)

**Retourne :**
```json
{
  "success": true/false,
  "error": "message d'erreur si échec",
  "restaurant_id": "uuid du restaurant"
}
```

---

## 🔧 4. EDGE FUNCTIONS

### `send-invitation`

**URL :** `/functions/v1/send-invitation`

**Méthode :** POST

**Headers requis :**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body :**
```json
{
  "email": "employe@example.com",
  "restaurantId": "uuid-du-restaurant"
}
```

**Ce qu'elle fait :**
1. Vérifie que l'utilisateur est chef
2. Vérifie que l'email n'existe pas déjà
3. Vérifie qu'il n'y a pas déjà une invitation en attente
4. Crée l'invitation avec un token sécurisé
5. Affiche l'email dans les logs (pour simulation)

**Réponse :**
```json
{
  "success": true,
  "message": "Invitation créée avec succès",
  "invitationUrl": "http://localhost:5173/invitation?token=xxx",
  "email": "employe@example.com",
  "note": "L'email a été simulé..."
}
```

**Note :** Pour l'instant, l'email est juste affiché dans les logs. Pour envoyer de vrais emails, il faudrait configurer un service comme Resend.

### `import-recipe` (existante)

Cette fonction continue de fonctionner. Les recettes importées sont automatiquement associées au restaurant de l'utilisateur grâce aux RLS policies.

---

## 💻 5. INTERFACE UTILISATEUR

### Nouvelles Pages Créées

#### A. Page "Équipe" (`TeamManagement.tsx`)

**Emplacement :** `src/components/Team/TeamManagement.tsx`

**Accessible par :** Chefs uniquement (onglet "Équipe" dans la navbar)

**Fonctionnalités :**
- Affiche la liste des membres de l'équipe du restaurant
- Affiche les invitations en attente
- Permet d'inviter un nouvel employé (formulaire avec email)
- Permet de supprimer une invitation en attente
- Les employés ne voient pas cet onglet

**Comment inviter un employé :**
1. Le chef clique sur "Inviter un employé"
2. Il saisit l'email de l'employé
3. Il clique sur "Envoyer l'invitation"
4. Une invitation est créée et l'URL est affichée dans les logs
5. L'invitation apparaît dans la section "Invitations en attente"

#### B. Page d'Inscription via Invitation (`InvitationSignup.tsx`)

**Emplacement :** `src/components/Auth/InvitationSignup.tsx`

**URL :** `/invitation?token=XXXXX`

**Accessible par :** Toute personne avec un lien d'invitation valide

**Fonctionnalités :**
- Affiche le nom du restaurant qui invite
- L'email est pré-rempli (lecture seule)
- L'employé saisit :
  - Son nom complet
  - Son poste (Cuisinier, Commis, etc.)
  - Son mot de passe (2 fois)
- Lors de la soumission :
  1. Crée le compte Supabase Auth
  2. Crée le profil
  3. Appelle `accept_invitation()` pour lier au restaurant
  4. Redirige vers l'application

**Gestion des erreurs :**
- Invitation expirée : Affiche un message d'erreur
- Invitation invalide : Affiche un message d'erreur
- Token manquant : Affiche un message d'erreur

### Modifications des Pages Existantes

#### `RegisterForm.tsx`

**Modifications :**
- Le champ "Établissement" est maintenant **requis**
- Label changé en "Nom du Restaurant"
- Message ajouté : "Vous serez le chef de ce restaurant"
- Lors de l'inscription :
  1. Crée un restaurant avec le nom fourni
  2. Crée le profil avec `restaurant_role = 'chef'`
  3. L'utilisateur devient automatiquement le chef

#### `App.tsx`

**Modifications :**
- Détection du paramètre `?token=` dans l'URL
- Si un token est présent, affiche `InvitationSignup`
- Nouvelle route `team` ajoutée

#### `Navbar.tsx`

**Modifications :**
- Nouvel onglet "Équipe" (visible uniquement aux chefs)
- Utilise `profile.restaurant_role === 'chef'` pour afficher/masquer

---

## 👥 6. GESTION DES RÔLES

### Rôles dans le restaurant (`restaurant_role`)

#### `chef` (Owner/Gérant)
**Ce qu'il peut faire :**
- ✅ Voir toutes les recettes du restaurant
- ✅ Créer des recettes
- ✅ Modifier des recettes
- ✅ Supprimer des recettes
- ✅ Importer des recettes avec l'IA
- ✅ Inviter des employés
- ✅ Gérer l'équipe
- ✅ Voir l'onglet "Équipe"

**Ce qu'il ne peut pas faire :**
- ❌ Voir les recettes d'autres restaurants
- ❌ Modifier les recettes d'autres restaurants

#### `employee` (Employé)
**Ce qu'il peut faire :**
- ✅ Voir toutes les recettes du restaurant
- ✅ Lire les instructions
- ✅ Voir les ingrédients

**Ce qu'il ne peut PAS faire :**
- ❌ Créer des recettes
- ❌ Modifier des recettes
- ❌ Supprimer des recettes
- ❌ Importer des recettes avec l'IA
- ❌ Inviter des employés
- ❌ Voir l'onglet "Équipe"

### Poste dans l'entreprise (`job_title`)

C'est le titre professionnel de la personne, indépendant de son rôle système :
- Chef
- Sous-Chef
- Chef de Partie
- Commis
- Cuisinier
- Pâtissier
- etc.

**Note :** `job_title` est juste informatif, il n'affecte pas les permissions.

---

## 🚀 7. WORKFLOW COMPLET

### Scénario 1 : Créer un nouveau restaurant

1. L'utilisateur va sur la page d'inscription
2. Il remplit le formulaire :
   - Nom complet : "Marie Dubois"
   - Email : "marie@restaurant-dubois.fr"
   - Poste : "Chef"
   - **Nom du Restaurant : "Restaurant Dubois"**
   - Mot de passe
3. Il clique sur "Créer mon compte"
4. Le système :
   - Crée le compte auth
   - Crée le restaurant "Restaurant Dubois"
   - Crée le profil avec `restaurant_role = 'chef'`
   - Marie est maintenant chef de son restaurant

### Scénario 2 : Inviter un employé

1. Marie (chef) se connecte
2. Elle clique sur l'onglet "Équipe"
3. Elle clique sur "Inviter un employé"
4. Elle saisit l'email : "jean@example.com"
5. Elle clique sur "Envoyer l'invitation"
6. Le système :
   - Crée une invitation dans la base
   - Génère un token sécurisé
   - Affiche l'URL d'invitation dans les logs
7. Marie copie l'URL et l'envoie à Jean par email/SMS

### Scénario 3 : Accepter une invitation

1. Jean reçoit l'URL : `http://localhost:5173/invitation?token=abc123...`
2. Il clique sur le lien
3. Il arrive sur la page d'inscription invitation
4. Il voit :
   - "Vous avez été invité à rejoindre **Restaurant Dubois**"
   - Email pré-rempli : jean@example.com (non modifiable)
5. Il remplit :
   - Nom complet : "Jean Martin"
   - Poste : "Commis de cuisine"
   - Mot de passe (2 fois)
6. Il clique sur "Créer mon compte"
7. Le système :
   - Crée le compte auth
   - Crée le profil
   - Appelle `accept_invitation()` qui :
     - Associe Jean au Restaurant Dubois
     - Lui donne le rôle `employee`
     - Marque l'invitation comme acceptée
   - Redirige vers l'application
8. Jean se retrouve dans l'application avec accès aux recettes du Restaurant Dubois (lecture seule)

---

## ⚠️ 8. POINTS IMPORTANTS / LIMITATIONS

### ✅ Ce qui fonctionne

1. **Isolation totale** : Chaque restaurant voit UNIQUEMENT ses propres recettes
2. **Permissions strictes** : Les employés ne peuvent QUE lire, jamais modifier
3. **Sécurité RLS** : Toutes les permissions sont enforced côté base de données
4. **Migration automatique** : Les utilisateurs existants ont été automatiquement transformés en chefs de leur propre restaurant
5. **Import IA** : Continue de fonctionner, les recettes sont automatiquement associées au restaurant

### ⚠️ Limitations actuelles

1. **Emails non envoyés** : Pour l'instant, les emails d'invitation sont juste affichés dans les logs. Pour envoyer de vrais emails, il faudrait :
   - Configurer un service d'email (Resend, SendGrid, etc.)
   - Ajouter la clé API dans les secrets Supabase
   - Modifier l'Edge Function `send-invitation`

2. **Permissions UI** : Actuellement, les boutons d'édition/suppression sont toujours affichés. Il faudrait les masquer pour les employés en vérifiant `profile.restaurant_role === 'chef'` dans les composants suivants :
   - `RecipeList.tsx`
   - `RecipeEditorWithSections.tsx`
   - Autres composants avec actions de modification

3. **Pas de gestion avancée** :
   - Pas de possibilité de retirer un employé
   - Pas de changement de rôle (employee → chef)
   - Pas de transfert de propriété du restaurant

---

## 📁 9. FICHIERS CRÉÉS / MODIFIÉS

### Nouveaux fichiers

```
supabase/migrations/
  └── 20251120000001_add_restaurant_management.sql

supabase/functions/
  └── send-invitation/
      └── index.ts

src/components/
  ├── Team/
  │   └── TeamManagement.tsx
  └── Auth/
      └── InvitationSignup.tsx
```

### Fichiers modifiés

```
src/
  ├── App.tsx (ajout routing invitation + page team)
  ├── lib/supabase.ts (types Profile et Recipe mis à jour)
  ├── contexts/AuthContext.tsx (signUp adapté pour restaurants)
  ├── components/
      ├── Auth/RegisterForm.tsx (champ restaurant requis)
      └── Layout/Navbar.tsx (onglet Équipe ajouté)
```

---

## 🧪 10. COMMENT TESTER

### Test 1 : Créer un restaurant

1. Déconnecte-toi si tu es connecté
2. Clique sur "Créer un compte"
3. Remplis le formulaire avec un nom de restaurant
4. Vérifie que tu es bien créé comme chef

### Test 2 : Inviter un employé

1. Connecte-toi en tant que chef
2. Va dans "Équipe"
3. Invite un employé avec un email
4. Récupère l'URL dans les logs
5. Ouvre l'URL dans un navigateur privé
6. Créé le compte employé
7. Vérifie qu'il ne voit pas l'onglet "Équipe"
8. Vérifie qu'il peut voir les recettes mais ne peut pas les modifier

### Test 3 : Isolation des restaurants

1. Crée un 2ème compte chef avec un autre restaurant
2. Créé des recettes dans ce 2ème restaurant
3. Reconnecte-toi avec le 1er chef
4. Vérifie que tu ne vois PAS les recettes du 2ème restaurant

---

## 🔧 11. PROCHAINES ÉTAPES (optionnelles)

Si tu veux améliorer le système :

1. **Envoyer de vrais emails** :
   - Configure Resend ou SendGrid
   - Modifie `send-invitation` pour utiliser l'API d'email

2. **Masquer les boutons pour les employés** :
   - Dans `RecipeList.tsx`, cache les boutons "Éditer", "Supprimer" si `restaurant_role === 'employee'`
   - Dans `RecipeImportAI.tsx`, cache tout le composant si `restaurant_role === 'employee'`

3. **Gestion avancée d'équipe** :
   - Ajouter un bouton "Retirer" à côté de chaque employé
   - Permettre de changer le rôle d'un membre
   - Ajouter un système de transfert de propriété

4. **Statistiques du restaurant** :
   - Nombre de recettes
   - Nombre d'employés
   - Recettes les plus consultées

---

## 💡 12. RÉSUMÉ POUR DÉBUTANTE

**En gros, voici ce que j'ai fait :**

1. **Créé une table `restaurants`** : Chaque restaurant a un nom et un propriétaire (chef)

2. **Modifié `profiles`** :
   - Ajouté `restaurant_id` : Pour savoir dans quel restaurant travaille l'utilisateur
   - Ajouté `restaurant_role` : 'chef' ou 'employee'

3. **Modifié `recipes`** :
   - Ajouté `restaurant_id` : Les recettes appartiennent au restaurant, pas juste à l'utilisateur

4. **Créé une table `invitations`** :
   - Pour gérer les invitations d'employés avec un système de token sécurisé

5. **Mis en place les RLS (sécurité)** :
   - Les chefs peuvent tout faire dans leur restaurant
   - Les employés ne peuvent que consulter

6. **Créé une Edge Function `send-invitation`** :
   - Pour créer les invitations
   - Pour l'instant, affiche juste l'email dans les logs

7. **Créé la page "Équipe"** :
   - Le chef peut voir son équipe
   - Il peut inviter des employés
   - Il peut supprimer des invitations en attente

8. **Créé la page d'inscription via invitation** :
   - L'employé clique sur le lien
   - Il créé son compte
   - Il est automatiquement rattaché au restaurant

9. **Adapté l'inscription normale** :
   - Quand tu crées un compte, tu crées aussi ton restaurant
   - Tu deviens automatiquement chef de ce restaurant

10. **Migré les données existantes** :
   - Tous les utilisateurs existants sont devenus chefs de leur propre restaurant

**Le résultat :** Maintenant ton application est multi-restaurant, avec une vraie gestion d'équipe et des permissions strictes !

---

## 📞 BESOIN D'AIDE ?

Si quelque chose ne fonctionne pas :

1. Vérifie les logs de la console du navigateur
2. Vérifie les logs Supabase (onglet Logs dans le dashboard)
3. Vérifie que les migrations ont bien été appliquées
4. Vérifie que les Edge Functions sont bien déployées

**Tables à vérifier dans Supabase :**
- `restaurants` : Doit contenir les restaurants
- `profiles` : Doit avoir les colonnes `restaurant_id` et `restaurant_role`
- `recipes` : Doit avoir la colonne `restaurant_id`
- `invitations` : Doit exister

**Bonnes pratiques :**
- Toujours vérifier `profile.restaurant_role` avant d'afficher des actions de modification
- Ne jamais faire confiance au frontend pour la sécurité, les RLS sont là pour ça
- Toujours tester avec plusieurs comptes (chef et employee) pour vérifier les permissions
