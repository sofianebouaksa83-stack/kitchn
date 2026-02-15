# 📧 Guide Complet: Invitations & Partage de Recettes

## 📋 Table des Matières

1. [Vue d'ensemble du système](#vue-densemble)
2. [Configuration des emails (Resend)](#configuration-emails)
3. [Inviter des membres d'équipe](#inviter-membres)
4. [Partager des recettes](#partager-recettes)
5. [Accepter une invitation](#accepter-invitation)
6. [Voir les recettes partagées](#voir-recettes-partagees)
7. [Gestion des permissions](#gestion-permissions)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble du système

KITCH'N propose un système complet de collaboration pour les restaurants:

### Rôles utilisateurs

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **Chef** | Propriétaire du restaurant | Peut tout faire: inviter, partager, gérer l'équipe |
| **Second** | Second de cuisine | Peut créer et partager des recettes |
| **Commis** | Commis de cuisine | Peut créer des recettes et voir celles partagées |
| **Stagiaire** | Stagiaire | Peut voir les recettes partagées |

### Flux de collaboration

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1. Chef crée son restaurant lors de l'inscription          │
│     ↓                                                        │
│  2. Chef invite des membres par email                       │
│     ↓                                                        │
│  3. Membres reçoivent un email avec lien d'invitation       │
│     ↓                                                        │
│  4. Membres s'inscrivent via le lien                        │
│     ↓                                                        │
│  5. Membres rejoignent automatiquement le restaurant        │
│     ↓                                                        │
│  6. Chef et équipe peuvent partager des recettes           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration des emails (Resend)

### Pourquoi Resend?

Resend est utilisé pour envoyer les emails d'invitation de manière professionnelle et fiable.

### Configuration rapide (5 minutes)

#### Étape 1: Créer un compte Resend

1. Aller sur [resend.com](https://resend.com)
2. Cliquer sur "Sign Up"
3. S'inscrire (gratuit - 3000 emails/mois)
4. Confirmer l'email

#### Étape 2: Obtenir la clé API

1. Se connecter à Resend
2. Aller dans [API Keys](https://resend.com/api-keys)
3. Cliquer "Create API Key"
4. Nommer: `kitch-n-production`
5. Permission: "Sending access"
6. **Copier la clé** (commence par `re_...`)

⚠️ **Important**: Sauvegarder la clé maintenant, elle ne sera plus affichée!

#### Étape 3: Configurer dans Supabase

**Via Dashboard (Recommandé)**:

1. [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet KITCH'N
3. Settings ⚙️ > Edge Functions
4. Onglet "Secrets"
5. Ajouter:
   - Name: `RESEND_API_KEY`
   - Value: `re_votre_cle_ici`
6. Save

**Via CLI** (alternative):
```bash
supabase secrets set RESEND_API_KEY=re_votre_cle_ici
```

#### Étape 4: Tester

1. Se connecter en tant que Chef
2. Aller dans "Équipe"
3. Inviter un email de test
4. Vérifier la réception de l'email

✅ **C'est prêt!** Les invitations sont maintenant envoyées automatiquement.

---

## 👥 Inviter des membres d'équipe

### Qui peut inviter?

Seuls les **Chefs** peuvent inviter de nouveaux membres.

### Comment inviter quelqu'un?

#### Via l'interface web

1. **Se connecter** en tant que Chef
2. **Cliquer** sur l'onglet **"Équipe"** dans la navigation
3. **Cliquer** sur le bouton **"Inviter un employé"**
4. **Remplir** le formulaire:
   - **Email**: Email professionnel du membre
   - **Rôle**: Choisir parmi Second, Commis, Stagiaire
5. **Cliquer** "Envoyer l'invitation"

#### Email d'invitation

Le membre reçoit un email professionnel contenant:

```
📧 De: KITCH'N <onboarding@resend.dev>
📬 Sujet: Invitation à rejoindre [Nom Restaurant] sur KITCH'N

Bonjour,

[Nom du Chef] vous invite à rejoindre [Nom du Restaurant]
sur KITCH'N en tant que [Rôle].

[Bouton: Accepter l'invitation]

Cette invitation expire dans 7 jours.
```

#### Que se passe-t-il ensuite?

1. Le membre clique sur "Accepter l'invitation"
2. Il est redirigé vers la page d'inscription
3. Il crée son compte (email, mot de passe, nom)
4. Il est **automatiquement** ajouté au restaurant
5. Il peut immédiatement voir les recettes partagées

### Gérer les invitations

Dans l'onglet "Équipe", vous voyez:

- **Membres actuels**: Liste des personnes dans le restaurant
- **Invitations en attente**: Emails invités mais pas encore acceptés

Actions disponibles:
- ❌ Supprimer une invitation en attente
- 🗑️ Retirer un membre de l'équipe

---

## 📤 Partager des recettes

### Qui peut partager?

Tous les rôles peuvent partager leurs propres recettes:
- ✅ Chef
- ✅ Second
- ✅ Commis
- ❌ Stagiaire (lecture seule)

### Types de partage

#### 1. Partage avec toute l'équipe (automatique)

Toutes les recettes d'un restaurant sont **automatiquement visibles** par tous les membres du restaurant grâce au champ `is_visible`:

- `is_visible = true` → Visible par toute l'équipe
- `is_visible = false` → Privée (visible uniquement par le créateur)

#### 2. Partage individuel (table recipe_shares)

Pour partager avec des personnes spécifiques **en dehors** de votre restaurant:

```sql
-- Structure de la table recipe_shares
CREATE TABLE recipe_shares (
  id uuid PRIMARY KEY,
  recipe_id uuid REFERENCES recipes(id),
  shared_with_user_id uuid REFERENCES profiles(id),
  shared_with_group_id uuid REFERENCES work_groups(id),
  permission text CHECK (permission IN ('read', 'edit')),
  shared_by uuid REFERENCES profiles(id),
  shared_at timestamptz DEFAULT now()
);
```

### Comment partager une recette?

#### Partage avec l'équipe (par défaut)

Lors de la création d'une recette, elle est **automatiquement visible** par tous les membres du restaurant si `is_visible = true`.

#### Partage avec une personne spécifique

*Note: Cette fonctionnalité nécessite d'ajouter l'interface de partage dans RecipeDisplay*

1. Ouvrir une recette
2. Cliquer sur "Partager"
3. Sélectionner un membre de l'équipe
4. Choisir la permission:
   - **Lecture** (`read`): Peut voir la recette
   - **Édition** (`edit`): Peut modifier la recette
5. Cliquer "Partager"

### Permissions

| Permission | Description | Droits |
|------------|-------------|--------|
| `read` | Lecture seule | Voir la recette, copier, scaler |
| `edit` | Lecture et édition | Tout + modifier la recette |

---

## ✅ Accepter une invitation

### Flux d'acceptation

1. **Recevoir l'email** d'invitation
2. **Cliquer** sur "Accepter l'invitation" dans l'email
3. **Redirection** vers: `https://votre-app.com/invitation?token=abc123`
4. **Inscription** automatique:
   - Email pré-rempli (celui invité)
   - Entrer mot de passe et nom complet
   - Cliquer "Créer mon compte"
5. **Connexion automatique** et ajout au restaurant

### Validation automatique

Lors de l'inscription via invitation:

1. Le token est vérifié dans la DB
2. Le compte est créé
3. Le profil est associé au restaurant
4. Le rôle est attribué automatiquement
5. L'invitation est marquée comme acceptée
6. L'utilisateur est connecté

### Expiration

Les invitations expirent après **7 jours**.

Si une invitation a expiré:
- Le lien ne fonctionne plus
- Le Chef doit renvoyer une invitation
- Supprimer l'ancienne invitation dans "Équipe"

---

## 📥 Voir les recettes partagées

### Accéder aux recettes partagées

1. **Se connecter** à KITCH'N
2. **Cliquer** sur l'onglet **"Recettes Partagées"**
3. **Voir** toutes les recettes:
   - Partagées par les membres de votre restaurant
   - Partagées spécifiquement avec vous

### Interface des recettes partagées

Pour chaque recette, vous voyez:

```
┌────────────────────────────────────────────────┐
│  🍲 Nom de la recette                          │
│                                                │
│  👤 Par: [Nom du créateur]                     │
│  ⏱️  Temps: [Prep + Cook]                      │
│  👥 Portions: [X couverts]                     │
│  👁️  Permission: [Lecture / Édition]           │
│                                                │
│  [Bouton: Voir la recette]                    │
└────────────────────────────────────────────────┘
```

### Actions possibles

#### Avec permission "Lecture" (`read`)

- ✅ Voir la recette complète
- ✅ Voir les ingrédients et proportions
- ✅ Scaler les quantités (augmenter/réduire couverts)
- ✅ Voir les instructions
- ❌ Modifier la recette

#### Avec permission "Édition" (`edit`)

- ✅ Tout ce que "Lecture" permet
- ✅ Modifier les ingrédients
- ✅ Modifier les instructions
- ✅ Changer le nombre de couverts
- ✅ Ajouter des notes

---

## 🔐 Gestion des permissions

### Hiérarchie des rôles

```
Chef (Propriétaire)
  │
  ├── Peut tout faire
  ├── Invite les membres
  ├── Gère l'équipe
  └── Peut retirer des membres

Second
  │
  ├── Peut créer des recettes
  ├── Peut partager ses recettes
  └── Voit toutes les recettes de l'équipe

Commis
  │
  ├── Peut créer des recettes
  ├── Peut partager ses recettes
  └── Voit toutes les recettes de l'équipe

Stagiaire
  │
  ├── Peut voir les recettes partagées
  └── Ne peut pas créer de recettes
```

### Politiques RLS (Row Level Security)

Le système utilise des politiques de sécurité au niveau base de données:

#### Recettes

```sql
-- Voir les recettes
SELECT:
  - Créateur peut voir ses propres recettes
  - Membres du même restaurant peuvent voir les recettes is_visible=true
  - Personnes avec recipe_shares peuvent voir les recettes partagées

-- Créer des recettes
INSERT:
  - Tout utilisateur authentifié (sauf stagiaires)

-- Modifier des recettes
UPDATE:
  - Créateur uniquement
  - OU personnes avec permission 'edit' via recipe_shares

-- Supprimer des recettes
DELETE:
  - Créateur uniquement
```

#### Invitations

```sql
-- Voir les invitations
SELECT:
  - Chef du restaurant concerné

-- Créer des invitations
INSERT:
  - Chef du restaurant uniquement

-- Supprimer des invitations
DELETE:
  - Chef du restaurant uniquement
```

---

## 🛠️ Troubleshooting

### Problème: Email d'invitation non reçu

#### Causes possibles

1. **Email dans les spams**
   - ✅ Vérifier le dossier spam/courrier indésirable
   - 💡 Ajouter `onboarding@resend.dev` aux contacts

2. **Resend pas configuré**
   - ✅ Vérifier que RESEND_API_KEY est configuré dans Supabase
   - ✅ Tester avec une nouvelle clé API

3. **Clé API incorrecte**
   - ✅ Vérifier que la clé commence par `re_`
   - ✅ Pas d'espaces avant/après
   - ✅ Recréer une nouvelle clé

4. **Email invalide**
   - ✅ Vérifier l'orthographe de l'email
   - ✅ Tester avec un autre email

5. **Quota dépassé**
   - ✅ Plan gratuit: 100 emails/jour, 3000/mois
   - ✅ Vérifier sur [Resend Analytics](https://resend.com/emails)

#### Solutions

**Vérifier les logs Supabase**:
1. Dashboard Supabase
2. Logs > Edge Functions
3. Filtrer: `send-invitation`
4. Chercher les erreurs

**Logs typiques**:
```
✅ Email envoyé avec succès via Resend: re_abc123
⚠️  RESEND_API_KEY non configuré - Email non envoyé
❌ Erreur Resend: 401 Unauthorized
```

**Renvoyer une invitation**:
1. Aller dans "Équipe"
2. Supprimer l'invitation en attente
3. Créer une nouvelle invitation

### Problème: Le lien d'invitation ne fonctionne pas

#### Causes

1. **Invitation expirée** (>7 jours)
   - ✅ Demander au Chef de renvoyer une invitation

2. **Token invalide**
   - ✅ Le lien a peut-être été copié incorrectement
   - ✅ Demander un nouveau lien

3. **Invitation déjà acceptée**
   - ✅ Se connecter avec le compte existant

#### Solution

1. Chef supprime l'ancienne invitation
2. Chef envoie une nouvelle invitation
3. Accepter immédiatement (dans les 7 jours)

### Problème: Ne voit pas les recettes partagées

#### Diagnostic

**Vérifier le rôle**:
```sql
SELECT restaurant_role FROM profiles WHERE id = 'user-id';
```

**Vérifier l'appartenance au restaurant**:
```sql
SELECT restaurant_id FROM profiles WHERE id = 'user-id';
```

**Vérifier les recettes visibles**:
```sql
SELECT id, title, is_visible, restaurant_id
FROM recipes
WHERE restaurant_id = 'restaurant-id'
AND is_visible = true;
```

#### Solutions

1. **Vérifier que `is_visible = true`** sur les recettes
2. **Vérifier que le membre appartient bien au restaurant**
3. **Rafraîchir la page** (Ctrl+R ou Cmd+R)
4. **Se déconnecter/reconnecter**

### Problème: Erreur lors du partage

#### Message d'erreur courant

```
"Erreur: Recipe not found or access denied"
```

#### Causes

1. La recette n'existe pas
2. L'utilisateur n'est pas le créateur
3. L'utilisateur cible n'existe pas

#### Solution

1. Vérifier que la recette existe
2. Vérifier que vous êtes le créateur
3. Vérifier que l'email du destinataire est correct

---

## 📊 Statistiques et monitoring

### Dashboard Resend

Voir tous les emails envoyés: [resend.com/emails](https://resend.com/emails)

Métriques disponibles:
- 📧 Emails envoyés
- ✅ Emails délivrés
- 📬 Emails ouverts
- 🔗 Clics sur les liens
- ❌ Bounces (échecs)

### Logs Supabase

**Edge Functions logs**:
1. Supabase Dashboard
2. Logs > Edge Functions
3. Filtrer par fonction:
   - `send-invitation` : Envoi des invitations
   - `import-recipe` : Import de recettes

**Database logs**:
1. Supabase Dashboard
2. Logs > Database
3. Voir les queries RLS

### Requêtes SQL utiles

**Invitations en attente**:
```sql
SELECT
  email,
  created_at,
  expires_at,
  EXTRACT(DAY FROM (expires_at - now())) as jours_restants
FROM invitations
WHERE accepted_at IS NULL
AND expires_at > now()
ORDER BY created_at DESC;
```

**Membres par restaurant**:
```sql
SELECT
  r.name as restaurant,
  COUNT(p.id) as nombre_membres,
  COUNT(CASE WHEN p.restaurant_role = 'chef' THEN 1 END) as chefs,
  COUNT(CASE WHEN p.restaurant_role = 'second' THEN 1 END) as seconds,
  COUNT(CASE WHEN p.restaurant_role = 'commis' THEN 1 END) as commis,
  COUNT(CASE WHEN p.restaurant_role = 'stagiaire' THEN 1 END) as stagiaires
FROM restaurants r
LEFT JOIN profiles p ON p.restaurant_id = r.id
GROUP BY r.id, r.name;
```

**Recettes partagées**:
```sql
SELECT
  r.title as recette,
  p1.full_name as cree_par,
  p2.full_name as partage_avec,
  rs.permission,
  rs.shared_at
FROM recipe_shares rs
JOIN recipes r ON r.id = rs.recipe_id
JOIN profiles p1 ON p1.id = rs.shared_by
JOIN profiles p2 ON p2.id = rs.shared_with_user_id
ORDER BY rs.shared_at DESC
LIMIT 20;
```

---

## 🚀 Cas d'usage courants

### Scénario 1: Nouveau restaurant

1. Chef s'inscrit sur KITCH'N
2. Crée son profil restaurant
3. Configure Resend (étape unique)
4. Invite son équipe (second, commis, stagiaires)
5. Équipe accepte les invitations
6. Chef crée des recettes de base
7. Équipe consulte et utilise les recettes

### Scénario 2: Import de recettes depuis Google Drive

1. Chef ou Second crée une recette
2. Upload d'un PDF/DOCX depuis Google Drive
3. IA analyse et structure la recette
4. Recette automatiquement visible par l'équipe
5. Équipe peut scaler et imprimer

### Scénario 3: Collaboration sur une recette

1. Second crée une nouvelle recette "Sauce Béarnaise"
2. Marque `is_visible = true`
3. Commis voit la recette dans "Recettes Partagées"
4. Commis utilise la recette pendant le service
5. Commis scale pour 20 couverts au lieu de 4

### Scénario 4: Formation d'un stagiaire

1. Chef invite le stagiaire par email
2. Stagiaire crée son compte via l'invitation
3. Stagiaire accède à toutes les recettes visibles
4. Stagiaire consulte les recettes sur tablette en cuisine
5. Stagiaire apprend les techniques du restaurant

---

## ✅ Checklist de mise en production

Avant d'utiliser le système en production:

### Configuration

- [ ] Compte Resend créé
- [ ] Clé API Resend récupérée
- [ ] `RESEND_API_KEY` configuré dans Supabase
- [ ] Test d'envoi d'invitation effectué
- [ ] Email d'invitation reçu et testé

### Tests

- [ ] Chef peut inviter des membres
- [ ] Membres reçoivent les emails
- [ ] Liens d'invitation fonctionnent
- [ ] Membres peuvent s'inscrire via invitation
- [ ] Membres voient les recettes partagées
- [ ] Scaling des recettes fonctionne

### Sécurité

- [ ] RLS activé sur toutes les tables
- [ ] Politiques testées et validées
- [ ] Clé API sécurisée (jamais dans Git)
- [ ] Tests avec différents rôles effectués

### Documentation

- [ ] Équipe formée au système d'invitations
- [ ] Guide utilisateur distribué
- [ ] Support technique défini

---

## 📞 Support

### Ressources

- **Documentation Resend**: [resend.com/docs](https://resend.com/docs)
- **Documentation Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Support Resend**: [resend.com/support](https://resend.com/support)

### Logs en cas de problème

**Toujours fournir**:
1. Message d'erreur exact
2. Logs Supabase Edge Functions
3. Logs Supabase Database
4. Étapes pour reproduire

---

## 🎉 Félicitations!

Vous savez maintenant:
- ✅ Configurer les emails avec Resend
- ✅ Inviter des membres d'équipe
- ✅ Gérer les rôles et permissions
- ✅ Partager des recettes
- ✅ Résoudre les problèmes courants

**Le système d'invitation et de partage est prêt pour la production! 🚀**
