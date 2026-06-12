const BACKUP_KEY = "injaz_auto_backup";
const BACKUP_META_KEY = "injaz_backup_meta";

export interface BackupMeta {
  lastBackup: string;
  inventoryCount: number;
  ordersCount: number;
}

export function saveAutoBackup(data: { inventory: unknown[]; orders: unknown[] }): void {
  try {
    const payload = JSON.stringify(data);
    if (payload.length > 4_000_000) {
      console.warn("[auto-backup] Data too large, skipping auto-backup");
      return;
    }
    localStorage.setItem(BACKUP_KEY, payload);
    const meta: BackupMeta = {
      lastBackup: new Date().toISOString(),
      inventoryCount: data.inventory.length,
      ordersCount: data.orders.length,
    };
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn("[auto-backup] Failed to save backup:", err);
  }
}

export function getBackupMeta(): BackupMeta | null {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAutoBackup(): { inventory: unknown[]; orders: unknown[] } | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAutoBackup(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(BACKUP_META_KEY);
  } catch (err) {
    console.warn("[auto-backup] clearAutoBackup failed:", err);
  }
}
