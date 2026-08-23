import type { NavItem } from "../types/navigation.types";

export function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function withCacheBuster(
  url: string,
  token: string
) {
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${encodeURIComponent(token)}`;
}

export function applySavedNavOrder(
  baseItems: NavItem[],
  savedKeys: string[]
): NavItem[] {
  const baseKeys = baseItems.map((item) => item.key);

  const filteredKeys = savedKeys.filter((key) =>
    baseKeys.includes(key)
  );

  const missingKeys = baseKeys.filter(
    (key) => !filteredKeys.includes(key)
  );

  const finalKeys = [
    ...filteredKeys,
    ...missingKeys,
  ];

  const itemsByKey = new Map(
    baseItems.map((item) => [item.key, item])
  );

  const orderedItems = finalKeys
    .map((key) => itemsByKey.get(key))
    .filter(
      (item): item is NavItem => Boolean(item)
    );

  return orderedItems.length
    ? orderedItems
    : baseItems;
}