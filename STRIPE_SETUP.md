# Configuration Stripe - Guide Complet

Ce guide vous accompagne pour finaliser la configuration de votre système d'abonnement Stripe.

## Étape 1 : Créer vos produits Stripe

Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com/products) et créez les 3 produits suivants :

### Produit 1 : Starter
- **Nom** : Starter
- **Prix** : 9 €/mois (récurrent)
- **Métadonnées** :
  - `plan_name` : `starter`
  - `max_users` : `3`
  - `features` : `creation_recettes`

### Produit 2 : Pro
- **Nom** : Pro
- **Prix** : 19 €/mois (récurrent)
- **Métadonnées** :
  - `plan_name` : `pro`
  - `max_users` : `15`
  - `features` : `creation_recettes,import_ai`

### Produit 3 : Pro+
- **Nom** : Pro+
- **Prix** : 29 €/mois (récurrent)
- **Métadonnées** :
  - `plan_name` : `pro_plus`
  - `max_users` : `45`
  - `features` : `creation_recettes,import_ai,multi_etablissements`

## Étape 2 : Récupérer les Price IDs

Après avoir créé chaque produit, notez les **Price IDs** (format : `price_xxxxx`). Vous en aurez besoin pour l'étape suivante.

## Étape 3 : Mettre à jour la base de données

Exécutez cette requête SQL dans votre base de données Supabase pour associer les Price IDs à vos plans :

```sql
UPDATE subscription_plans
SET stripe_price_id = 'price_VOTRE_ID_STARTER'
WHERE id = 'starter';

UPDATE subscription_plans
SET stripe_price_id = 'price_VOTRE_ID_PRO'
WHERE id = 'pro';

UPDATE subscription_plans
SET stripe_price_id = 'price_VOTRE_ID_PRO_PLUS'
WHERE id = 'pro_plus';
```

**Remplacez** `price_VOTRE_ID_XXX` par vos véritables Price IDs Stripe.

## Étape 4 : Configurer les webhooks Stripe

1. Allez dans [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **Ajouter un endpoint**
3. **URL de l'endpoint** : `https://VOTRE_PROJET.supabase.co/functions/v1/stripe-webhook`
4. **Sélectionnez les événements à écouter** :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Après création, récupérez le **Signing secret** (format : `whsec_xxxxx`)

## Étape 5 : Configurer les variables d'environnement Supabase

Dans votre projet Supabase, allez dans **Settings > Edge Functions > Secrets** et ajoutez :

```bash
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
```

**Important** : Utilisez vos clés de **test** pendant le développement, puis passez aux clés de **production** lors du déploiement.

## Étape 6 : Configurer le Customer Portal Stripe

1. Allez dans [Settings > Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
2. Activez le portail client
3. Configurez les options :
   - ✅ Permettre aux clients d'annuler leur abonnement
   - ✅ Permettre aux clients de changer de plan
   - ✅ Permettre aux clients de mettre à jour leur moyen de paiement
   - ✅ Afficher l'historique de facturation

## Étape 7 : Tester le système

### Test en mode développement :

1. Utilisez une [carte de test Stripe](https://stripe.com/docs/testing) :
   - Numéro : `4242 4242 4242 4242`
   - Date d'expiration : N'importe quelle date future
   - CVC : N'importe quel code à 3 chiffres

2. Testez les flux suivants :
   - ✅ Souscription à un plan
   - ✅ Changement de plan (upgrade/downgrade)
   - ✅ Annulation d'abonnement
   - ✅ Mise à jour du moyen de paiement
   - ✅ Webhooks (vérifier les logs dans Stripe et Supabase)

## Fonctionnalités implémentées

### 1. Pages frontend
- ✅ Page de sélection des plans (`/subscription`)
- ✅ Page de gestion d'abonnement
- ✅ Page de succès (`/subscription/success`)
- ✅ Page d'annulation (`/subscription/cancel`)

### 2. Edge Functions
- ✅ `create-checkout-session` - Créer une session de paiement
- ✅ `stripe-webhook` - Gérer les événements Stripe
- ✅ `manage-subscription` - Accès au portail client

### 3. Base de données
- ✅ Table `subscription_plans` - Plans disponibles
- ✅ Table `subscriptions` - Abonnements actifs
- ✅ Synchronisation automatique avec `restaurants.current_plan_id`
- ✅ Politiques RLS pour la sécurité

### 4. Contrôles d'accès
- ✅ Hook personnalisé `useSubscription()`
- ✅ Vérification des fonctionnalités selon le plan
- ✅ Limite du nombre d'utilisateurs par plan

## Limitations par plan

### Starter (9€/mois)
- ✅ Création de recettes illimitée
- ❌ Import/génération IA
- ❌ Multi-établissements
- 👥 Maximum 3 utilisateurs

### Pro (19€/mois)
- ✅ Création de recettes illimitée
- ✅ Import/génération IA
- ❌ Multi-établissements
- 👥 Maximum 15 utilisateurs

### Pro+ (29€/mois)
- ✅ Création de recettes illimitée
- ✅ Import/génération IA
- ✅ Multi-établissements
- 👥 Maximum 45 utilisateurs

## Prochaines étapes

Pour implémenter les restrictions d'accès basées sur les plans :

1. **Bloquer l'import IA pour Starter** :
```typescript
// Dans RecipeImportAI.tsx
const { hasFeature } = useSubscription();
if (!hasFeature('import_ai')) {
  return <UpgradePrompt feature="L'import IA" requiredPlan="Pro" />;
}
```

2. **Vérifier la limite d'utilisateurs** :
```typescript
// Dans TeamManagement.tsx
const { canAddUser } = useSubscription();
const isLimitReached = !(await canAddUser());
if (isLimitReached) {
  // Afficher un message d'erreur
}
```

## Support

En cas de problème :
1. Vérifiez les logs Stripe Dashboard > Développeurs > Logs
2. Vérifiez les logs Supabase > Edge Functions > Logs
3. Testez les webhooks manuellement dans Stripe

## Mode Production

Avant de passer en production :

1. ✅ Remplacez toutes les clés de test par les clés de production
2. ✅ Configurez le webhook pour l'URL de production
3. ✅ Testez tous les flux de paiement en production
4. ✅ Activez les emails Stripe pour les confirmations
5. ✅ Configurez la facturation et les taxes si nécessaire
