import type {
  RecipeDisplayIngredient,
  RecipeDisplayRow,
} from "../types/recipe.types";

export const CROSS_MANUAL_VALUE = "__manual__";

export function fmtQty(quantity: number | null) {
  if (quantity === null || Number.isNaN(quantity)) {
    return "—";
  }

  const rounded = Math.round(quantity * 100) / 100;
  const text = String(rounded);

  return text.endsWith(".0") ? text.slice(0, -2) : text;
}

export function normUnit(unit: string | null) {
  return (unit ?? "").trim();
}

export function isQS(unit: string | null) {
  const normalized = normUnit(unit).toLowerCase();

  return (
    normalized === "qs" ||
    normalized === "q.s" ||
    normalized === "q.s." ||
    normalized === "quantité suffisante"
  );
}

export function formatQtyDisplay(
  scaledQuantity: number | null,
  unit: string | null
) {
  const normalizedUnit = normUnit(unit);

  if (isQS(unit)) return "QS";
  if (scaledQuantity === null) {
    return normalizedUnit || "—";
  }

  if (scaledQuantity === 0) return "";

  return `${fmtQty(scaledQuantity)}${
    normalizedUnit ? ` ${normalizedUnit}` : ""
  }`.trim();
}

export function ingredientLabel(
  ingredient: RecipeDisplayIngredient
) {
  const designation =
    ingredient.designation?.trim() || "—";
  const unit = normUnit(ingredient.unit);
  const quantity = ingredient.quantity;

  if (quantity === null || !Number.isFinite(quantity)) {
    return designation;
  }

  return `${designation} (${fmtQty(quantity)}${
    unit ? ` ${unit}` : ""
  })`;
}

export function getRecipeImageUrls(
  recipe: RecipeDisplayRow | null
) {
  if (!recipe) return [];

  const urls = [
    ...(Array.isArray(recipe.image_urls)
      ? recipe.image_urls
      : []),
    recipe.image_url ?? "",
  ]
    .map((url) => String(url).trim())
    .filter(Boolean);

  return Array.from(new Set(urls));
}

export function formatCoefficient(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "1";
  }

  return String(Math.round(value * 100) / 100);
}

export function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map(safeText)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const entries = Object.entries(
      value as Record<string, unknown>
    );

    const checkedKeys = entries
      .filter(([, entryValue]) => entryValue === true)
      .map(([key]) => key);

    if (checkedKeys.length > 0) {
      return checkedKeys.join(", ");
    }

    return entries
      .map(([key, entryValue]) => {
        const text = safeText(entryValue);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return String(value).trim();
}
