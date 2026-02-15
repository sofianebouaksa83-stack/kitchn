# 📧 Configuration de l'Envoi d'Emails avec Resend

## ✅ Ce qui a été fait

L'Edge Function `send-invitation` a été **mise à jour** pour envoyer de vrais emails via Resend.

**Statut actuel :**
- ✅ Code prêt pour envoyer des emails
- ⚠️ Resend pas encore configuré (emails simulés dans les logs)

---

## 🚀 Configuration en 3 Étapes (5 minutes)

### Étape 1 : Créer un compte Resend (gratuit)

1. **Aller sur** : https://resend.com
2. **Cliquer** sur "Sign Up"
3. **S'inscrire** avec ton email GitHub ou email
4. **Confirmer** ton email

**Plan gratuit :**
- ✅ 3,000 emails/mois gratuits
- ✅ 100 emails/jour
- ✅ Idéal pour commencer !

---

### Étape 2 : Récupérer la clé API

1. **Se connecter** à Resend
2. **Aller dans** : https://resend.com/api-keys
3. **Cliquer** sur "Create API Key"
4. **Nommer** la clé : `kitch-n-invitations`
5. **Permissions** : Choisir "Sending access"
6. **Copier** la clé qui commence par `re_...`

**⚠️ IMPORTANT : Sauvegarde bien cette clé, elle ne sera affichée qu'une seule fois !**

Exemple de clé :
```
re_123abc456def789ghi012jkl345mno678pqr
```

---

### Étape 3 : Configurer dans Supabase

#### Option A : Via le Dashboard Supabase (Recommandé)

1. **Aller sur** : https://supabase.com/dashboard
2. **Sélectionner** ton projet KITCH'N
3. **Aller dans** : Settings (⚙️) > Edge Functions
4. **Cliquer** sur l'onglet "Secrets"
5. **Ajouter un nouveau secret** :
   - **Name** : `RESEND_API_KEY`
   - **Value** : Coller ta clé API (celle qui commence par `re_...`)
6. **Cliquer** sur "Save"

#### Option B : Via CLI Supabase (Alternative)

```bash
# Si tu as la CLI Supabase installée
supabase secrets set RESEND_API_KEY=re_ton_api_key_ici
```

---

## ✅ Vérification

### Test 1 : Inviter un employé

1. **Connecte-toi** en tant que chef
2. **Va dans** l'onglet "Équipe"
3. **Clique** sur "Inviter un employé"
4. **Saisis** un email (le tien pour tester)
5. **Clique** sur "Envoyer l'invitation"

### Test 2 : Vérifier l'email

1. **Vérifie** ta boîte mail
2. **Regarde** dans les spams si besoin
3. **Tu devrais recevoir** un email comme celui-ci :

```
📧 De : KITCH'N <onboarding@resend.dev>
📬 Sujet : Invitation à rejoindre [Nom du Restaurant] sur KITCH'N

[Email avec design professionnel + bouton "Accepter l'invitation"]
```

### Test 3 : Vérifier les logs

1. **Va dans** Supabase > Logs > Edge Functions
2. **Cherche** `send-invitation`
3. **Tu devrais voir** :
   ```
   ✅ Email envoyé avec succès via Resend: re_abc123...
   ```

---

## 🎨 Personnalisation de l'Email (Optionnel)

### Utiliser ton propre domaine

Par défaut, les emails sont envoyés depuis `onboarding@resend.dev`. Pour utiliser ton propre domaine :

1. **Aller sur** Resend > Domains
2. **Cliquer** sur "Add Domain"
3. **Entrer** ton domaine : `monrestaurant.fr`
4. **Ajouter** les DNS records (fournis par Resend)
5. **Vérifier** le domaine

Une fois vérifié, **modifier l'Edge Function** :

```typescript
// Dans send-invitation/index.ts, ligne 37
from: 'KITCH\'N <noreply@monrestaurant.fr>', // Au lieu de onboarding@resend.dev
```

### Modifier le design de l'email

Le template HTML est dans l'Edge Function (`send-invitation/index.ts`) à partir de la ligne 148.

Tu peux modifier :
- Les couleurs (actuellement orange/amber)
- Le texte
- La structure
- Ajouter ton logo

---

## 🔍 Dépannage

### Problème : Email non reçu

**Causes possibles :**

1. **Email dans les spams**
   - ✅ Vérifier le dossier spam/courrier indésirable
   - 💡 Ajouter `onboarding@resend.dev` aux contacts

2. **Clé API incorrecte**
   - ✅ Vérifier que la clé commence par `re_`
   - ✅ Vérifier qu'il n'y a pas d'espaces avant/après
   - ✅ Recréer une nouvelle clé si nécessaire

3. **Email invalide**
   - ✅ Vérifier que l'email est correct
   - ✅ Tester avec un autre email

4. **Quota dépassé**
   - ✅ Plan gratuit : 100 emails/jour max
   - ✅ Vérifier sur Resend Dashboard > Analytics

### Problème : Erreur dans les logs

**Erreur :** `RESEND_API_KEY non configuré`
- ✅ Tu n'as pas encore ajouté la clé dans Supabase
- ✅ Suis l'Étape 3 ci-dessus

**Erreur :** `401 Unauthorized`
- ✅ La clé API est incorrecte
- ✅ Vérifie que tu as copié la bonne clé
- ✅ Crée une nouvelle clé si nécessaire

**Erreur :** `403 Forbidden`
- ✅ La clé n'a pas les bonnes permissions
- ✅ Crée une nouvelle clé avec "Sending access"

**Erreur :** `429 Too Many Requests`
- ✅ Tu as dépassé le quota (100 emails/jour en gratuit)
- ✅ Attends 24h ou passe au plan payant

### Vérifier que tout fonctionne

Execute cette commande dans l'onglet SQL de Supabase :

```sql
-- Vérifier les invitations récentes
SELECT
  email,
  restaurant_id,
  created_at,
  accepted_at,
  expires_at
FROM invitations
WHERE created_at > now() - interval '1 day'
ORDER BY created_at DESC;
```

---

## 📊 Monitoring

### Dashboard Resend

Tous tes emails sont trackés sur : https://resend.com/emails

Tu peux voir :
- 📧 Emails envoyés
- ✅ Emails délivrés
- 📬 Emails ouverts
- 🔗 Clics sur les liens
- ❌ Bounces et erreurs

### Logs Supabase

Pour voir tous les envois d'invitations :
1. Supabase Dashboard
2. Logs > Edge Functions
3. Filtrer par `send-invitation`

---

## 💰 Plans Resend

### Gratuit (actuellement)
- ✅ 3,000 emails/mois
- ✅ 100 emails/jour
- ✅ 1 domaine vérifié
- ✅ Support communauté

### Pro ($20/mois)
- ✅ 50,000 emails/mois
- ✅ Emails supplémentaires : $1/1000
- ✅ 10 domaines vérifiés
- ✅ Support prioritaire
- ✅ Webhooks avancés

**💡 Pour un restaurant avec 10 employés, le plan gratuit est largement suffisant !**

---

## 🔐 Sécurité

### Bonnes pratiques

1. **Ne jamais partager** ta clé API
2. **Ne jamais commiter** la clé dans Git
3. **Utiliser** uniquement les secrets Supabase
4. **Révoquer** les clés inutilisées
5. **Créer** une nouvelle clé si compromise

### Révocation d'une clé

Si tu penses que ta clé a été compromise :

1. **Aller sur** Resend > API Keys
2. **Trouver** la clé concernée
3. **Cliquer** sur "Revoke"
4. **Créer** une nouvelle clé
5. **Mettre à jour** dans Supabase

---

## 🎯 Résumé des Étapes

```
┌─────────────────────────────────────────────────┐
│ 1. Créer compte Resend (gratuit)               │
│    → https://resend.com                         │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 2. Récupérer clé API                            │
│    → https://resend.com/api-keys               │
│    → Créer clé avec "Sending access"            │
│    → Copier la clé (re_...)                     │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 3. Configurer dans Supabase                     │
│    → Settings > Edge Functions > Secrets        │
│    → Name: RESEND_API_KEY                       │
│    → Value: [coller la clé]                     │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ 4. Tester                                        │
│    → Inviter un employé                         │
│    → Vérifier l'email                           │
└─────────────────────────────────────────────────┘
                     ↓
              ✅ TERMINÉ !
```

---

## 📞 Besoin d'Aide ?

- **Documentation Resend** : https://resend.com/docs
- **Support Resend** : https://resend.com/support
- **Logs Supabase** : Pour voir les erreurs en temps réel

---

## ✅ Checklist Finale

Avant de passer en production :

- [ ] Compte Resend créé
- [ ] Clé API récupérée
- [ ] Clé configurée dans Supabase (RESEND_API_KEY)
- [ ] Test d'envoi effectué
- [ ] Email reçu et lien fonctionne
- [ ] Domaine personnalisé vérifié (optionnel)
- [ ] Email design personnalisé (optionnel)

**Une fois ces étapes validées, ton système d'invitation est 100% opérationnel ! 🎉**
