export function isValidUsername(value: string) {
  if (!value) return true;
  return /^[a-z0-9_]{3,20}$/i.test(value);
}

export function isValidUrl(value: string) {
  try {
    if (!value) return true;
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function passwordScore(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 5);
}

export function storagePathFromPublicUrl(
  url: string,
  bucket = "avatars"
) {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(marker);

    if (index === -1) return null;

    return url.slice(index + marker.length);
  } catch {
    return null;
  }
}

export function withCacheBuster(url: string, token: string) {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${encodeURIComponent(token)}`;
}