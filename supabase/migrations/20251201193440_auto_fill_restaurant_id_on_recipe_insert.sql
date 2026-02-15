/*
  # Auto-remplir restaurant_id lors de la création de recette

  1. Problème
    - Les seconds ne peuvent pas créer de recettes car restaurant_id n'est pas rempli
    - Le frontend n'envoie que user_id lors de la création
    - Le restaurant_id devrait être automatiquement récupéré depuis profiles

  2. Solution
    - Créer une fonction trigger qui remplit automatiquement restaurant_id
    - Récupérer le restaurant_id depuis la table profiles de l'utilisateur
    - Trigger s'exécute BEFORE INSERT sur recipes

  3. Sécurité
    - Le trigger s'exécute avant l'insertion
    - Vérifie que l'utilisateur a un profil avec restaurant_id
    - Si pas de restaurant_id, laisse NULL (pour recettes personnelles)
*/

-- ============================================
-- FONCTION : Auto-remplir restaurant_id
-- ============================================

CREATE OR REPLACE FUNCTION auto_fill_restaurant_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Si restaurant_id n'est pas fourni, on le récupère depuis profiles
  IF NEW.restaurant_id IS NULL THEN
    SELECT restaurant_id INTO NEW.restaurant_id
    FROM profiles
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER : Exécuter avant INSERT sur recipes
-- ============================================

DROP TRIGGER IF EXISTS trigger_auto_fill_restaurant_id ON recipes;

CREATE TRIGGER trigger_auto_fill_restaurant_id
  BEFORE INSERT ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION auto_fill_restaurant_id();
