const AUDIT_KEY = "injaz_audit_log";

export interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

export function getAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAuditEntry(
  action: string,
  userId: string,
  userName: string,
  details: string
) {
  const entries = getAuditLog();
  entries.unshift({
    id: crypto.randomUUID(),
    action,
    userId,
    userName,
    details,
    timestamp: new Date().toISOString(),
  });
  if (entries.length > 1000) entries.length = 1000;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}
