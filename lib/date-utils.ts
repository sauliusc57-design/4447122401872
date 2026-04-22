// Convert a Date object to a "YYYY-MM-DD" string for storage in the database
export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parse a "YYYY-MM-DD" database string back into a local Date object
export function parseDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  // Use local constructor (not UTC) so the date matches the user's timezone
  return new Date(y, m - 1, d);
}
