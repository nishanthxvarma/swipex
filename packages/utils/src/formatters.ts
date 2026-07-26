/** Formats a salary range */
export function formatSalary(min?: number, max?: number, currency: string = '$'): string {
  if (!min && !max) return 'Not specified';
  const formatNum = (num: number) => num >= 1000 ? `${Math.round(num / 1000)}K` : num.toString();
  if (min && !max) return `${currency}${formatNum(min)}+`;
  if (!min && max) return `Up to ${currency}${formatNum(max)}`;
  return `${currency}${formatNum(min!)} - ${currency}${formatNum(max!)}`;
}

/** Formats date into relative time string */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/** Formats company size text */
export function formatCompanySize(size: string | number): string {
  if (typeof size === 'number') {
    if (size < 50) return '1-50 employees';
    if (size < 200) return '51-200 employees';
    if (size < 1000) return '201-1,000 employees';
    if (size < 5000) return '1,001-5,000 employees';
    return '5,000+ employees';
  }
  return size;
}

/** Truncates text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/** Generates initials from name */
export function generateInitials(name: string): string {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Formats number to compact string like 1.2K */
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}
