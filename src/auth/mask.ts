export function maskKey(key: string): string {
  if (!key) return "none";
  const last4 = key.slice(-4);
  const masked = key.slice(0, -4).replace(/[^-]/g, "x");
  return masked + last4;
}
