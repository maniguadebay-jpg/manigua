export function formatCompactNumber(n: number | null | undefined): string {
  const num = Number(n ?? 0);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(num);
}

export function formatFullNumber(n: number | null | undefined): string {
  const num = Number(n ?? 0);
  if (isNaN(num)) return '0';
  return num.toLocaleString('fr-FR');
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  try {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

export function formatDuration(seconds: number | null | undefined): string {
  const s = Number(seconds ?? 0);
  if (isNaN(s) || s <= 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function readingTime(text: string | null | undefined): string {
  if (!text) return '1 min';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

export function timeAgo(value: Date | string | null | undefined): string {
  if (!value) return '';
  try {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '';
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `il y a ${Math.floor(diff / 86400)} j`;
    if (diff < 31536000) return `il y a ${Math.floor(diff / 2592000)} mois`;
    return `il y a ${Math.floor(diff / 31536000)} an(s)`;
  } catch {
    return '';
  }
}