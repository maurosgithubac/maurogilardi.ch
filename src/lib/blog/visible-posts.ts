/** Public posts go live at `created_at` (not only when `published` is true). */

export function isPostVisible(createdAt: string, now = new Date()): boolean {
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && t <= now.getTime();
}

export function publishedAtOrBeforeIso(now = new Date()): string {
  return now.toISOString();
}
